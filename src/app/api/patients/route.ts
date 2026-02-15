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

  const { prisma } = await import("@/lib/db");
  const patients = await prisma.patient.findMany({
    where: search
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
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(patients);
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

      // Handle file uploads
      const nationalIdFile = formData.get("nationalIdPhoto") as File | null;
      const birthCertFile = formData.get("birthCertificatePhoto") as File | null;

      if (nationalIdFile && nationalIdFile.size > 0) {
        body.nationalIdPhoto = await uploadFile(nationalIdFile, "nid");
      }

      if (birthCertFile && birthCertFile.size > 0) {
        body.birthCertificatePhoto = await uploadFile(birthCertFile, "bc");
      }
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
      examinationLink,
      emergencyContact,
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
    const patient = await prisma.patient.create({
      data: {
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
        examinationLink: examinationLink ? String(examinationLink) : null,
        emergencyContact: emergencyContact ? String(emergencyContact) : null,
        notes: notes ? String(notes) : null,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Create patient error:", error);
    const message = error instanceof Error ? error.message : "خطا در ثبت بیمار";
    // Pass through user-actionable errors (e.g. BLOB_READ_WRITE_TOKEN) even in production
    const isActionable = message.includes("BLOB_READ_WRITE_TOKEN") || message.includes("DATABASE");
    const errorToReturn =
      process.env.NODE_ENV === "development" || isActionable ? message : "خطا در ثبت بیمار";
    return NextResponse.json({ error: errorToReturn }, { status: 500 });
  }
}
