import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toPersianDigits, normalizeToAsciiDigits } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ qrCodeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { qrCodeId } = await params;
  const { prisma } = await import("@/lib/db");
  const patient = await prisma.patient.findUnique({
    where: { qrCodeId },
  });

  if (!patient) {
    return { title: "اطلاعات یافت نشد" };
  }

  return {
    title: `اطلاعات پزشکی - ${patient.firstName} ${patient.lastName}`,
    description: `اطلاعات پزشکی و دیابتی بیمار`,
  };
}

export default async function PublicPatientPage({ params }: Props) {
  const { qrCodeId } = await params;

  const { prisma } = await import("@/lib/db");
  const patient = await prisma.patient.findUnique({
    where: { qrCodeId },
  });

  if (!patient) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pageUrl = `${baseUrl}/patient/${patient.qrCodeId}`;
  let qrDataUrl: string | null = null;
  try {
    const QRCode = (await import("qrcode")).default;
    qrDataUrl = await QRCode.toDataURL(pageUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  } catch {
    // ignore
  }

  const diabetesLabel =
    patient.diabetesType === "type1"
      ? "دیابت نوع ۱"
      : patient.diabetesType === "type2"
        ? "دیابت نوع ۲"
        : "بدون دیابت";

  const hasPhotos = !!(patient.nationalIdPhoto || patient.birthCertificatePhoto);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="rounded-lg text-slate-600" asChild>
            <Link href="/" className="inline-flex items-center gap-1">
              <ArrowRight className="size-4" />
              برگشت
            </Link>
          </Button>
        </div>
        {/* Header */}
        <p className="mb-6 text-center text-xs font-medium tracking-wide text-slate-500">
          سامانه جامع اطلاعات بیماران دیابتی
        </p>

        {/* Patient name */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">اطلاعات پزشکی بیمار</p>
        </div>

        {/* Emergency strip */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-500">گروه خونی</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{patient.bloodType || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">نوع دیابت</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{diabetesLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">تماس اضطراری</p>
              {patient.emergencyContact ? (
                <a
                  href={`tel:${normalizeToAsciiDigits(patient.emergencyContact).replace(/\D/g, "")}`}
                  className="mt-1 block text-lg font-bold text-primary hover:underline"
                >
                  {toPersianDigits(patient.emergencyContact)}
                </a>
              ) : (
                <p className="mt-1 text-slate-400">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">اطلاعات شناسایی</h2>
          <dl className="space-y-4">
            <InfoItem label="کد ملی" value={toPersianDigits(patient.nationalId)} />
            {patient.birthCertificateId && (
              <InfoItem label="شماره شناسنامه" value={toPersianDigits(patient.birthCertificateId)} />
            )}
            <InfoItem label="شهر" value={patient.city} />
            {patient.placeOfLiving && (
              <InfoItem label="محل سکونت" value={patient.placeOfLiving} />
            )}
            {patient.birthDate && (
              <InfoItem label="تاریخ تولد" value={patient.birthDate} />
            )}
            {patient.address && (
              <InfoItem label="آدرس" value={patient.address} />
            )}
            {patient.treatingPhysician && (
              <InfoItem label="پزشک معالج" value={patient.treatingPhysician} />
            )}
          </dl>
        </div>

        {/* Documents / Uploaded images */}
        {hasPhotos && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">مدارک شناسایی</h2>
            <div className={`grid gap-6 ${patient.nationalIdPhoto && patient.birthCertificatePhoto ? "sm:grid-cols-2" : ""}`}>
              {patient.nationalIdPhoto && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-600">کارت ملی</p>
                  <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg bg-white">
                    <Image
                      src={patient.nationalIdPhoto}
                      alt="کارت ملی"
                      width={360}
                      height={256}
                      className="max-h-64 w-full object-contain"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
              {patient.birthCertificatePhoto && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-600">شناسنامه</p>
                  <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg bg-white">
                    <Image
                      src={patient.birthCertificatePhoto}
                      alt="شناسنامه"
                      width={360}
                      height={256}
                      className="max-h-64 w-full object-contain"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Examination link */}
        {patient.examinationLink && (
          <div className="mb-8">
            <Button className="w-full rounded-xl py-6 text-base font-medium" size="lg" asChild>
              <a
                href={patient.examinationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                لینک معاینه / آزمایش
              </a>
            </Button>
          </div>
        )}

        {/* Notes */}
        {patient.notes && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">توضیحات</h2>
            <p className="leading-relaxed text-slate-800">{patient.notes}</p>
          </div>
        )}

        {/* QR code: show first, then option to download */}
        {qrDataUrl && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">QR کد این صفحه</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR کد بیمار" className="h-52 w-52 sm:h-64 sm:w-64" />
              </div>
              <Button size="sm" className="rounded-xl" asChild>
                <a
                  href={qrDataUrl}
                  download={`qr-${patient.firstName}-${patient.lastName}.png`}
                >
                  دانلود QR کد
                </a>
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          دسترسی از طریق اسکن QR کد
        </p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
