import { NextRequest, NextResponse } from "next/server";
import { generateQrCodeId, normalizeIranianNationalId, normalizeSearchForNationalId } from "@/lib/utils";
import { uploadFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { isAdminAuthenticated } = await import("@/lib/auth");
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const nationalIdSearch = normalizeSearchForNationalId(search);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where = search
    ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          ...(nationalIdSearch ? [{ nationalId: { contains: nationalIdSearch } }] : []),
          { birthCertificateId: { contains: search } },
          { city: { contains: search } },
          { qrCodeId: { contains: search } },
        ],
      }
    : undefined;

  const { prisma } = await import("@/lib/db");
  const [total, patients] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  return NextResponse.json({
    patients,
    total,
    page,
    limit,
    totalPages,
  });
}

export async function POST(request: NextRequest) {
  const { isAdminAuthenticated } = await import("@/lib/auth");
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

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

      const [nationalIdUrl, birthCertUrl, ...eduAndExam] = await Promise.all([
        nationalIdFile?.size ? uploadFile(nationalIdFile, "nid") : Promise.resolve(null),
        birthCertFile?.size ? uploadFile(birthCertFile, "bc") : Promise.resolve(null),
        ...educationalFileList.map((f, i) => uploadFile(f, `edu-${i}`)),
        ...examinationFileList.map((f, i) => uploadFile(f, `exam-${i}`)),
      ]);
      if (nationalIdUrl) body.nationalIdPhoto = nationalIdUrl;
      if (birthCertUrl) body.birthCertificatePhoto = birthCertUrl;
      const nEdu = educationalFileList.length;
      const eduUrls = eduAndExam.slice(0, nEdu).filter((u): u is string => u != null);
      const examUrls = eduAndExam.slice(nEdu).filter((u): u is string => u != null);
      if (eduUrls.length > 0) body.educationalFiles = JSON.stringify(eduUrls);
      if (examUrls.length > 0) body.examinationFiles = JSON.stringify(examUrls);
      if (formData.get("emergencyContact2") !== undefined)
        body.emergencyContact2 = formData.get("emergencyContact2");
    } else {
      body = await request.json();
    }

    const {
      firstName,
      lastName,
      nationalId,
      birthCertificateId,
      city,
      placeOfLiving,
      birthDate,
      address,
      nationalIdPhoto,
      birthCertificatePhoto,
      bloodType,
      diabetesType,
      weightKg,
      heightCm,
      emergencyContact,
      emergencyContact2,
      educationalFiles,
      examinationFiles,
      treatingPhysician,
      notes,
    } = body;

    if (!firstName || !lastName || !nationalId || !city) {
      return NextResponse.json(
        { error: "نام، نام خانوادگی، کد ملی و شهر الزامی هستند" },
        { status: 400 }
      );
    }

    const nationalIdStr = normalizeIranianNationalId(String(nationalId));
    if (!nationalIdStr) {
      return NextResponse.json(
        { error: "کد ملی نامعتبر است. لطفاً ۱۰ رقم صحیح را وارد کنید." },
        { status: 400 }
      );
    }

    const qrCodeId = generateQrCodeId();

    const nationalIdPhotoPath =
      typeof nationalIdPhoto === "string" &&
      (nationalIdPhoto.startsWith("/") || nationalIdPhoto.startsWith("http"))
        ? nationalIdPhoto
        : null;
    const birthCertPath =
      typeof birthCertificatePhoto === "string" &&
      (birthCertificatePhoto.startsWith("/") || birthCertificatePhoto.startsWith("http"))
        ? birthCertificatePhoto
        : null;

    const { prisma } = await import("@/lib/db");
    const createData = {
      qrCodeId,
      firstName: String(firstName),
      lastName: String(lastName),
      nationalId: nationalIdStr,
      birthCertificateId: birthCertificateId ? String(birthCertificateId) : null,
      city: String(city),
      placeOfLiving: placeOfLiving ? String(placeOfLiving) : null,
      birthDate: birthDate ? String(birthDate) : null,
      address: address ? String(address) : null,
      nationalIdPhoto: nationalIdPhotoPath,
      birthCertificatePhoto: birthCertPath,
      bloodType: bloodType && String(bloodType) !== "" ? String(bloodType) : null,
      diabetesType: diabetesType ? String(diabetesType) : null,
      weightKg: weightKg != null && weightKg !== "" ? Number(weightKg) : null,
      heightCm: heightCm != null && heightCm !== "" ? Number(heightCm) : null,
      emergencyContact: emergencyContact ? String(emergencyContact) : null,
      emergencyContact2: emergencyContact2 ? String(emergencyContact2) : null,
      educationalFiles:
        educationalFiles && typeof educationalFiles === "string" ? educationalFiles : null,
      examinationFiles:
        examinationFiles && typeof examinationFiles === "string" ? examinationFiles : null,
      treatingPhysician: treatingPhysician ? String(treatingPhysician) : null,
      notes: notes ? String(notes) : null,
    };

    let patient: { id: string; qrCodeId: string; firstName: string; lastName: string; [key: string]: unknown };
    try {
      patient = await prisma.patient.create({ data: createData });
    } catch (createError) {
      const msg = createError instanceof Error ? createError.message : "";
      const missingColumn =
        (msg.includes("column") || msg.includes("Unknown")) &&
        (msg.includes("treatingPhysician") || msg.includes("emergencyContact2") || msg.includes("educationalFiles") || msg.includes("examinationFiles") || msg.includes("weightKg") || msg.includes("heightCm"));
      if (missingColumn) {
        const { treatingPhysician: _1, emergencyContact2: _2, educationalFiles: _3, examinationFiles: _4, weightKg: _5, heightCm: _6, ...fallbackData } = createData;
        patient = await prisma.patient.create({ data: fallbackData });
      } else {
        throw createError;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}/patient/${patient.qrCodeId}`;
    let qrCode: string | null = null;
    try {
      const QRCode = (await import("qrcode")).default;
      qrCode = await QRCode.toDataURL(qrUrl, {
        width: 512,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    } catch {
      // ignore
    }
    return NextResponse.json(
      qrCode ? { ...patient, qrCode, qrUrl } : patient
    );
  } catch (error) {
    console.error("Create patient error:", error);
    const message = error instanceof Error ? error.message : "خطا در ثبت بیمار";
    const isActionable =
      message.includes("BLOB_READ_WRITE_TOKEN") ||
      message.includes("DATABASE") ||
      message.includes("connect") ||
      message.includes("ECONNREFUSED") ||
      message.includes("P1001") ||
      message.includes("Can't reach");
    const errorToReturn =
      process.env.NODE_ENV === "development" || isActionable ? message : "خطا در ثبت بیمار";
    return NextResponse.json({ error: errorToReturn }, { status: 500 });
  }
}
