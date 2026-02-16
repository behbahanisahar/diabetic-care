"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function parseJsonStringArray(value: string | null | undefined): string[] {
  if (value == null || value === "") return [];
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
import { Trash2 } from "lucide-react";
import PatientForm from "../PatientForm";
import { Button } from "@/components/ui/button";
import { prepareFormDataWithResizedImages } from "@/lib/image-preview";
import { submitFormWithProgress } from "@/lib/submit-with-progress";
import { toPersianDigits } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface City {
  id: number;
  name: string;
  slug: string;
}

interface Patient {
  id: string;
  qrCodeId: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  city: string;
  placeOfLiving: string | null;
  birthCertificateId: string | null;
  birthDate: string | null;
  address: string | null;
  nationalIdPhoto: string | null;
  birthCertificatePhoto: string | null;
  bloodType: string | null;
  diabetesType: string | null;
  weightKg: number | null;
  heightCm: number | null;
  examinationLink: string | null;
  emergencyContact: string | null;
  emergencyContact2: string | null;
  educationalFiles: string | null;
  examinationFiles: string | null;
  treatingPhysician: string | null;
  notes: string | null;
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"idle" | "resizing" | "sending">("idle");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/patients/${id}`).then((r) => r.json()),
      fetch("/api/cities").then((r) => r.json()),
    ])
      .then(([pData, citiesData]) => {
        if (pData.id) setPatient(pData);
        if (Array.isArray(citiesData)) setCities(citiesData);
      })
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!patient) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "خطا در حذف بیمار");
        return;
      }
      toast.success("بیمار حذف شد");
      router.push("/admin/patients");
      router.refresh();
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setLoadingPhase("resizing");
    setUploadPercent(0);
    try {
      const body = await prepareFormDataWithResizedImages(formData);
      setLoadingPhase("sending");
      const { ok, data } = await submitFormWithProgress(
        `/api/patients/${id}`,
        "PUT",
        body,
        (p) => setUploadPercent(p)
      );
      if (!ok) {
        toast.error((data as { error?: string })?.error || "خطا در بروزرسانی");
        return;
      }
      toast.success("تغییرات ذخیره شد");
      router.push("/admin/patients");
      router.refresh();
    } catch {
      toast.error("خطا در بروزرسانی");
    } finally {
      setLoading(false);
      setLoadingPhase("idle");
      setUploadPercent(0);
    }
  };

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="mb-4 text-muted-foreground">بیمار یافت نشد.</p>
        <Button variant="link" asChild>
          <Link href="/admin/patients">بازگشت به لیست</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" className="rounded-xl -ms-2" asChild>
          <Link href="/admin/patients">← بازگشت به لیست</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={async () => {
              const res = await fetch(`/api/patients/${id}/qr`);
              const data = await res.json();
              if (data.qrCode) {
                const a = document.createElement("a");
                a.href = data.qrCode;
                a.download = `qr-${patient.firstName}-${patient.lastName}.png`;
                a.click();
              }
            }}
          >
            دانلود QR کد
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link href={`/patient/${patient.qrCodeId}`} target="_blank" rel="noopener noreferrer">
              مشاهده صفحه عمومی
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="size-3.5 me-1" />
            حذف
          </Button>
        </div>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">ویرایش بیمار</h1>
      <PatientForm
        cities={cities}
        submitLabel="ذخیره تغییرات"
        loadingLabel={
          loadingPhase === "resizing"
            ? "در حال فشرده‌سازی تصاویر..."
            : uploadPercent > 0
              ? `در حال ارسال... ${toPersianDigits(String(uploadPercent))}٪`
              : "در حال ارسال..."
        }
        cancelHref="/admin/patients"
        cancelLabel="انصراف"
        initialData={{
          firstName: patient.firstName,
          lastName: patient.lastName,
          nationalId: patient.nationalId,
          birthCertificateId: patient.birthCertificateId || "",
          city: patient.city,
          placeOfLiving: patient.placeOfLiving || "",
          birthDate: patient.birthDate || "",
          address: patient.address || "",
          bloodType: patient.bloodType || "",
          diabetesType: patient.diabetesType || "none",
          weightKg: patient.weightKg != null ? String(patient.weightKg) : "",
          heightCm: patient.heightCm != null ? String(patient.heightCm) : "",
          examinationLink: patient.examinationLink || "",
          emergencyContact: patient.emergencyContact || "",
          emergencyContact2: patient.emergencyContact2 || "",
          treatingPhysician: patient.treatingPhysician || "",
          notes: patient.notes || "",
        }}
        initialNationalIdPhoto={patient.nationalIdPhoto || undefined}
        initialBirthCertificatePhoto={patient.birthCertificatePhoto || undefined}
        initialEducationalFiles={parseJsonStringArray(patient.educationalFiles)}
        initialExaminationFiles={parseJsonStringArray(patient.examinationFiles)}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف بیمار</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف {patient?.firstName} {patient?.lastName} اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <Button variant="destructive" size="sm" className="rounded-lg" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "در حال حذف..." : "بله، حذف شود"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
