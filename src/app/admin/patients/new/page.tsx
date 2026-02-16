"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PatientForm from "../PatientForm";
import { Button } from "@/components/ui/button";
import { prepareFormDataWithResizedImages } from "@/lib/image-preview";
import { submitFormWithProgress } from "@/lib/submit-with-progress";
import { toPersianDigits } from "@/lib/utils";

interface City {
  id: number;
  name: string;
  slug: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"idle" | "resizing" | "sending">("idle");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [qrResult, setQrResult] = useState<{ qrCode: string; qrUrl: string; firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setCities(data) : []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setLoadingPhase("resizing");
    setUploadPercent(0);
    try {
      const body = await prepareFormDataWithResizedImages(formData);
      setLoadingPhase("sending");
      const { ok, status, data } = await submitFormWithProgress(
        "/api/patients",
        "POST",
        body,
        (p) => setUploadPercent(p)
      );
      if (!ok) {
        toast.error((data as { error?: string })?.error || "خطا در ثبت");
        return;
      }
      const d = data as { qrCode?: string; qrUrl?: string; firstName?: string; lastName?: string };
      if (d.qrCode && d.qrUrl) {
        setQrResult({
          qrCode: d.qrCode,
          qrUrl: d.qrUrl,
          firstName: d.firstName ?? "",
          lastName: d.lastName ?? "",
        });
      } else {
        router.push("/admin/patients");
      }
    } catch {
      toast.error("خطا در ثبت بیمار");
    } finally {
      setLoading(false);
      setLoadingPhase("idle");
      setUploadPercent(0);
    }
  };

  if (qrResult) {
    return (
      <div className="mx-auto max-w-md px-6 py-12">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <svg className="size-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">بیمار با موفقیت ثبت شد</h2>
          <p className="mt-1 text-sm text-muted-foreground">QR کد منحصربه‌فرد بیمار</p>
          <img
            src={qrResult.qrCode}
            alt="QR Code"
            className="mx-auto mt-6 rounded-2xl border border-slate-200 p-4 bg-white"
          />
          <div className="mt-6 flex flex-col gap-3">
            <a href={qrResult.qrCode} download={`qr-${qrResult.firstName}-${qrResult.lastName}.png`}>
              <Button className="h-11 w-full rounded-xl">دانلود QR کد</Button>
            </a>
            <Button variant="outline" className="h-11 rounded-xl" onClick={() => router.push("/admin/patients")}>
              بازگشت به لیست
            </Button>
            <Button
              variant="secondary"
              className="h-11 rounded-xl"
              onClick={() => {
                setQrResult(null);
                router.push("/admin/patients/new");
              }}
            >
              ثبت بیمار دیگر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">ثبت بیمار جدید</h1>
      <PatientForm
        cities={cities}
        onSubmit={handleSubmit}
        loading={loading}
        loadingLabel={
          loadingPhase === "resizing"
            ? "در حال فشرده‌سازی تصاویر..."
            : uploadPercent > 0
              ? `در حال ارسال... ${toPersianDigits(String(uploadPercent))}٪`
              : "در حال ارسال..."
        }
      />
    </div>
  );
}
