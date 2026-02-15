import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public API - no auth required. Returns patient data for QR code scanners
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  const { qrCodeId } = await params;

  const { prisma } = await import("@/lib/db");
  const patient = await prisma.patient.findUnique({
    where: { qrCodeId },
  });

  if (!patient) {
    return NextResponse.json({ error: "اطلاعات یافت نشد" }, { status: 404 });
  }

  // Return public-safe data (no internal IDs)
  return NextResponse.json({
    firstName: patient.firstName,
    lastName: patient.lastName,
    nationalId: patient.nationalId,
    birthCertificateId: patient.birthCertificateId,
    city: patient.city,
    placeOfLiving: patient.placeOfLiving,
    birthDate: patient.birthDate,
    address: patient.address,
    bloodType: patient.bloodType,
    diabetesType: patient.diabetesType,
    examinationLink: patient.examinationLink,
    emergencyContact: patient.emergencyContact,
    nationalIdPhoto: patient.nationalIdPhoto,
    birthCertificatePhoto: patient.birthCertificatePhoto,
  });
}
