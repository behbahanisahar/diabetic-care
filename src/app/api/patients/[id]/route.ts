import { NextRequest, NextResponse } from "next/server";
import { normalizeIranianNationalId } from "@/lib/utils";
import { uploadFile } from "@/lib/upload";

function parseJsonStringArray(value: FormDataEntryValue | null): string[] {
  if (value == null || typeof value !== "string") return [];
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdminAuthenticated } = await import("@/lib/auth");
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;
  const { prisma } = await import("@/lib/db");
  const patient = await prisma.patient.findUnique({ where: { id } });

  if (!patient) {
    return NextResponse.json({ error: "بیمار یافت نشد" }, { status: 404 });
  }

  return NextResponse.json(patient);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdminAuthenticated } = await import("@/lib/auth");
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries()) as Record<string, unknown>;

      const nationalIdFile = formData.get("nationalIdPhoto") as File | null;
      const birthCertFile = formData.get("birthCertificatePhoto") as File | null;
      const educationalFileList = formData
        .getAll("educationalFiles")
        .filter((f): f is File => f instanceof File && f.size > 0);
      const examinationFileList = formData
        .getAll("examinationFiles")
        .filter((f): f is File => f instanceof File && f.size > 0);
      const existingEdu = formData.get("existingEducationalFiles");
      const existingExam = formData.get("existingExaminationFiles");

      const [nationalIdUrl, birthCertUrl, ...eduAndExam] = await Promise.all([
        nationalIdFile?.size ? uploadFile(nationalIdFile, "nid") : Promise.resolve(null),
        birthCertFile?.size ? uploadFile(birthCertFile, "bc") : Promise.resolve(null),
        ...educationalFileList.map((f, i) => uploadFile(f, `edu-${Date.now()}-${i}`)),
        ...examinationFileList.map((f, i) => uploadFile(f, `exam-${Date.now()}-${i}`)),
      ]);
      if (nationalIdUrl) body.nationalIdPhoto = nationalIdUrl;
      if (birthCertUrl) body.birthCertificatePhoto = birthCertUrl;

      const nEdu = educationalFileList.length;
      const newEduUrls = eduAndExam.slice(0, nEdu).filter((u): u is string => u != null);
      const newExamUrls = eduAndExam.slice(nEdu).filter((u): u is string => u != null);
      const existingEduArr = parseJsonStringArray(existingEdu);
      const existingExamArr = parseJsonStringArray(existingExam);
      body.educationalFiles = JSON.stringify([...existingEduArr, ...newEduUrls]);
      body.examinationFiles = JSON.stringify([...existingExamArr, ...newExamUrls]);
      if (formData.get("emergencyContact2") !== undefined)
        body.emergencyContact2 = formData.get("emergencyContact2");
    } else {
      body = await request.json();
    }

    if (body.nationalId !== undefined && body.nationalId !== "") {
      const nationalIdStr = normalizeIranianNationalId(String(body.nationalId));
      if (!nationalIdStr) {
        return NextResponse.json(
          { error: "کد ملی نامعتبر است. لطفاً ۱۰ رقم صحیح را وارد کنید." },
          { status: 400 }
        );
      }
      body.nationalId = nationalIdStr;
    }

    const updateData: Record<string, unknown> = {};
    const scalarFields = [
      "firstName", "lastName", "nationalId", "birthCertificateId", "city", "placeOfLiving",
      "birthDate", "address", "bloodType", "diabetesType", "examinationLink", "emergencyContact", "emergencyContact2", "treatingPhysician", "notes"
    ];

    for (const field of scalarFields) {
      if (body[field] !== undefined) {
        const value = body[field] === "" ? null : body[field];
        updateData[field] = value;
      }
    }

    const nationalIdUrl =
      typeof body.nationalIdPhoto === "string" &&
      (body.nationalIdPhoto.startsWith("/") || body.nationalIdPhoto.startsWith("http"));
    const birthCertUrl =
      typeof body.birthCertificatePhoto === "string" &&
      (body.birthCertificatePhoto.startsWith("/") || body.birthCertificatePhoto.startsWith("http"));
    if (nationalIdUrl) {
      updateData.nationalIdPhoto = body.nationalIdPhoto;
    } else if (body.nationalIdPhoto !== undefined && typeof body.nationalIdPhoto !== "object") {
      updateData.nationalIdPhoto = body.nationalIdPhoto === "" ? null : body.nationalIdPhoto;
    }
    if (birthCertUrl) {
      updateData.birthCertificatePhoto = body.birthCertificatePhoto;
    } else if (body.birthCertificatePhoto !== undefined && typeof body.birthCertificatePhoto !== "object") {
      updateData.birthCertificatePhoto = body.birthCertificatePhoto === "" ? null : body.birthCertificatePhoto;
    }
    if (body.educationalFiles !== undefined && typeof body.educationalFiles === "string") {
      updateData.educationalFiles = body.educationalFiles;
    }
    if (body.examinationFiles !== undefined && typeof body.examinationFiles === "string") {
      updateData.examinationFiles = body.examinationFiles;
    }

    const { prisma } = await import("@/lib/db");
    let patient;
    try {
      patient = await prisma.patient.update({
        where: { id },
        data: updateData,
      });
    } catch (updateError) {
      const msg = updateError instanceof Error ? updateError.message : "";
      const missingCol =
        (msg.includes("column") || msg.includes("Unknown")) &&
        (msg.includes("treatingPhysician") || msg.includes("emergencyContact2") || msg.includes("educationalFiles") || msg.includes("examinationFiles"));
      if (missingCol) {
        const { treatingPhysician: _1, emergencyContact2: _2, educationalFiles: _3, examinationFiles: _4, ...fallback } = updateData;
        patient = await prisma.patient.update({ where: { id }, data: fallback });
      } else {
        throw updateError;
      }
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Update patient error:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی بیمار" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdminAuthenticated } = await import("@/lib/auth");
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;
  const { prisma } = await import("@/lib/db");
  const patient = await prisma.patient.findUnique({ where: { id } });

  if (!patient) {
    return NextResponse.json({ error: "بیمار یافت نشد" }, { status: 404 });
  }

  try {
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete patient error:", error);
    return NextResponse.json(
      { error: "خطا در حذف بیمار" },
      { status: 500 }
    );
  }
}
