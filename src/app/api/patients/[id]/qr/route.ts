import { NextRequest, NextResponse } from "next/server";

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrUrl = `${baseUrl}/patient/${patient.qrCodeId}`;

  try {
    const QRCode = (await import("qrcode")).default;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    return NextResponse.json({ qrCode: qrDataUrl, qrUrl });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "خطا در ساخت QR کد" },
      { status: 500 }
    );
  }
}
