"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchIcon, Pencil, Download, ExternalLink, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toPersianDigits } from "@/lib/utils";

interface Patient {
  id: string;
  qrCodeId: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  city: string;
  diabetesType: string | null;
  bloodType: string | null;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    q.set("page", String(page));
    q.set("limit", String(PAGE_SIZE));
    setLoading(true);
    fetch(`/api/patients?${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.patients && Array.isArray(data.patients)) {
          setPatients(data.patients);
          setTotal(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
        } else {
          setPatients([]);
          setTotal(0);
          setTotalPages(0);
        }
      })
      .catch(() => {
        setPatients([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  const handleDownloadQR = async (p: Patient) => {
    const res = await fetch(`/api/patients/${p.id}/qr`);
    const data = await res.json();
    if (data.qrCode) {
      const link = document.createElement("a");
      link.href = data.qrCode;
      link.download = `qr-${p.firstName}-${p.lastName}.png`;
      link.click();
    }
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/patients/${patientToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "خطا در حذف بیمار");
        return;
      }
      toast.success("بیمار با موفقیت حذف شد");
      setPatients((prev) => prev.filter((x) => x.id !== patientToDelete.id));
      setTotal((t) => Math.max(0, t - 1));
      setPatientToDelete(null);
      if (patients.length <= 1 && page > 1) setPage((p) => p - 1);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">لیست بیماران</h1>
        <p className="mt-1 text-sm text-slate-500">جستجو و مدیریت بیماران دیابتی</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="جستجو نام، کد ملی، شهر..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border-slate-200 bg-white ps-10"
          />
        </div>
        <Button className="h-11 shrink-0 rounded-xl font-medium" asChild>
          <Link href="/admin/patients/new">بیمار جدید</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500">در حال بارگذاری...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-500">
              {search ? "نتیجه‌ای یافت نشد." : "هنوز بیماری ثبت نشده است."}
            </p>
            {!search && (
              <Button variant="link" className="mt-2" asChild>
                <Link href="/admin/patients/new">ثبت اولین بیمار</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:gap-6 sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {p.firstName[0]} {p.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {toPersianDigits(p.nationalId)} · {p.city}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.diabetesType === "type1" && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          دیابت نوع ۱
                        </span>
                      )}
                      {p.diabetesType === "type2" && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          دیابت نوع ۲
                        </span>
                      )}
                      {p.bloodType && (
                        <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                          {p.bloodType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <TooltipProvider delayDuration={300}>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:justify-start">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 rounded-lg px-3" asChild>
                          <Link href={`/admin/patients/${p.id}`}>
                            <Pencil className="size-3.5 me-1" />
                            ویرایش
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">ویرایش</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-lg border border-input bg-background">
                          <Link
                            href={`/patient/${p.qrCodeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-full items-center gap-1.5 px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                          >
                            <ExternalLink className="size-3.5" />
                            مشاهده
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDownloadQR(p)}
                            className="flex h-full items-center justify-center border-s border-input px-2 hover:bg-accent hover:text-accent-foreground"
                            title="دانلود QR"
                          >
                            <Download className="size-3.5" />
                          </button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">مشاهده صفحه بیمار / دانلود QR</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                          onClick={() => setPatientToDelete(p)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">حذف</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            ))}
          </div>
        )}
        {!loading && total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:px-6">
            <p className="text-sm text-slate-500">
              نمایش {toPersianDigits(String((page - 1) * PAGE_SIZE + 1))}–
              {toPersianDigits(String(Math.min(page * PAGE_SIZE, total)))} از {toPersianDigits(String(total))}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronRight className="size-4" />
                قبلی
              </Button>
              <span className="min-w-24 text-center text-sm text-slate-600">
                صفحه {toPersianDigits(String(page))} از {toPersianDigits(String(totalPages))}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                بعدی
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف بیمار</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف {patientToDelete ? `${patientToDelete.firstName} ${patientToDelete.lastName}` : ""} اطمینان دارید؟ این عمل قابل بازگشت نیست.
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
