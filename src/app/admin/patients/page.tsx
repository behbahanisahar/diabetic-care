"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, Pencil, Download, ExternalLink, Trash2, ChevronRight, ChevronLeft, QrCode, ArrowRight, MoreVertical, Calendar } from "lucide-react";
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
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn, toPersianDigits } from "@/lib/utils";

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
  const [qrModalPatient, setQrModalPatient] = useState<Patient | null>(null);
  const [qrModalImage, setQrModalImage] = useState<string | null>(null);
  const [qrModalLoading, setQrModalLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    q.set("page", String(page));
    q.set("limit", String(PAGE_SIZE));
    q.set("order", sortOrder);
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
  }, [search, page, sortOrder]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenuId(null);
    }
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  function formatDateShamsi(iso: string) {
    try {
      const d = new DateObject(new Date(iso));
      d.convert(persian, persian_fa);
      return d.format("YYYY/MM/DD");
    } catch {
      return "—";
    }
  }

  useEffect(() => {
    if (!qrModalPatient) {
      setQrModalImage(null);
      return;
    }
    setQrModalLoading(true);
    setQrModalImage(null);
    fetch(`/api/patients/${qrModalPatient.id}/qr`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.qrCode) setQrModalImage(data.qrCode);
      })
      .finally(() => setQrModalLoading(false));
  }, [qrModalPatient]);

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
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:mx-auto lg:max-w-6xl lg:px-4 lg:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">لیست بیماران</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">جستجو و مدیریت بیماران دیابتی</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full min-w-0 sm:max-w-[280px]">
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="جستجو نام، کد ملی، شهر..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border-slate-200 bg-white ps-10 sm:h-11"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="size-4 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "desc" | "asc");
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="desc">جدیدترین اول</option>
              <option value="asc">قدیمی‌ترین اول</option>
            </select>
          </div>
        </div>
        <Button className="h-10 shrink-0 rounded-xl font-medium sm:h-11" asChild>
          <Link href="/admin/patients/new">بیمار جدید</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent sm:size-10" />
            <p className="mt-3 text-sm text-slate-500">در حال بارگذاری...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center sm:py-20">
            <p className="text-sm text-slate-500">
              {search ? "نتیجه‌ای یافت نشد." : "هنوز بیماری ثبت نشده است."}
            </p>
            {!search && (
              <Button variant="link" className="mt-2" asChild>
                <Link href="/admin/patients/new">ثبت اولین بیمار</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop: table layout */}
            <div className="hidden overflow-x-auto lg:block" dir="rtl">
              <table className="w-full min-w-[640px] border-collapse text-right">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-medium text-slate-500">
                    <th className="py-3 pe-4 ps-4">نام</th>
                    <th className="py-3 pe-4">کد ملی</th>
                    <th className="py-3 pe-4">شهر</th>
                    <th className="py-3 pe-4">تاریخ ثبت</th>
                    <th className="py-3 pe-4">نوع دیابت / گروه خونی</th>
                    <th className="w-12 py-3 pe-4 ps-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer transition-colors hover:bg-slate-50/50"
                      onClick={() => router.push(`/admin/patients/${p.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/admin/patients/${p.id}`);
                        }
                      }}
                    >
                      <td className="py-3 pe-4 ps-4">
                        <span className="font-semibold text-slate-900">{p.firstName} {p.lastName}</span>
                      </td>
                      <td className="font-national-id py-3 pe-4 text-sm tabular-nums text-slate-700">{toPersianDigits(p.nationalId)}</td>
                      <td className="py-3 pe-4 text-sm text-slate-600">{p.city}</td>
                      <td className="py-3 pe-4 text-sm text-slate-500">{formatDateShamsi(p.createdAt)}</td>
                      <td className="py-3 pe-4">
                        <div className="flex flex-wrap gap-1">
                          {p.diabetesType === "type1" && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">نوع ۱</span>
                          )}
                          {p.diabetesType === "type2" && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">نوع ۲</span>
                          )}
                          {p.bloodType && (
                            <span className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{p.bloodType}</span>
                          )}
                        </div>
                      </td>
                      <td className="relative z-10 py-3 pe-4 ps-4" onClick={(e) => e.stopPropagation()}>
                        <div className={cn("relative inline-block", openMenuId === p.id && "z-[100]")} ref={openMenuId === p.id ? menuRef : undefined}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) => (prev === p.id ? null : p.id));
                            }}
                            aria-expanded={openMenuId === p.id}
                            aria-haspopup="true"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                          {openMenuId === p.id && (
                            <div className="absolute left-0 top-full z-[100] mt-1 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg" dir="rtl">
                              <Link href={`/admin/patients/${p.id}`} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setOpenMenuId(null)}>
                                <Pencil className="size-4" /> ویرایش
                              </Link>
                              <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setQrModalPatient(p); setOpenMenuId(null); }}>
                                <QrCode className="size-4" /> نمایش QR
                              </button>
                              <Link href={`/patient/${p.qrCodeId}`} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
                                <ExternalLink className="size-4" /> مشاهده صفحه
                              </Link>
                              <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { handleDownloadQR(p); setOpenMenuId(null); }}>
                                <Download className="size-4" /> دانلود QR
                              </button>
                              <hr className="my-1 border-slate-100" />
                              <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/5" onClick={() => { setPatientToDelete(p); setOpenMenuId(null); }}>
                                <Trash2 className="size-4" /> حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet: compact cards */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {patients.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-slate-50/50 sm:gap-4 sm:p-4"
                  onClick={() => router.push(`/admin/patients/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/admin/patients/${p.id}`);
                    }
                  }}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary sm:size-11 sm:rounded-xl">
                    {p.firstName[0]} {p.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                    <p className="font-national-id truncate text-xs text-slate-500 sm:text-sm">
                      {toPersianDigits(p.nationalId)} · {p.city}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                      <span>{formatDateShamsi(p.createdAt)}</span>
                      {p.diabetesType === "type1" && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">نوع ۱</span>
                      )}
                      {p.diabetesType === "type2" && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">نوع ۲</span>
                      )}
                      {p.bloodType && (
                        <span className="rounded border border-slate-200 px-1.5 py-0.5 text-slate-600">{p.bloodType}</span>
                      )}
                    </div>
                  </div>
                  <div className="relative shrink-0" ref={openMenuId === p.id ? menuRef : undefined} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === p.id ? null : p.id));
                      }}
                      aria-expanded={openMenuId === p.id}
                      aria-haspopup="true"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                    {openMenuId === p.id && (
                      <div className="absolute left-0 top-full z-[100] mt-1 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg" dir="rtl">
                        <Link href={`/admin/patients/${p.id}`} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setOpenMenuId(null)}>
                          <Pencil className="size-4" /> ویرایش
                        </Link>
                        <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setQrModalPatient(p); setOpenMenuId(null); }}>
                          <QrCode className="size-4" /> نمایش QR
                        </button>
                        <Link href={`/patient/${p.qrCodeId}`} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
                          <ExternalLink className="size-4" /> مشاهده صفحه
                        </Link>
                        <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { handleDownloadQR(p); setOpenMenuId(null); }}>
                          <Download className="size-4" /> دانلود QR
                        </button>
                        <hr className="my-1 border-slate-100" />
                        <button type="button" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/5" onClick={() => { setPatientToDelete(p); setOpenMenuId(null); }}>
                          <Trash2 className="size-4" /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
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

      {/* QR modal: اول کاربر QR را می‌بیند، بعد می‌تواند دانلود یا مشاهده صفحه */}
      {qrModalPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="qr-modal-title" className="text-lg font-semibold text-slate-900">
                QR کد — {qrModalPatient.firstName} {qrModalPatient.lastName}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={() => setQrModalPatient(null)}
              >
                <ArrowRight className="size-4 me-1" />
                برگشت
              </Button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {qrModalLoading ? (
                <div className="flex size-52 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : qrModalImage ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrModalImage} alt="QR کد بیمار" className="h-52 w-52" />
                </div>
              ) : (
                <p className="text-sm text-slate-500">بارگذاری QR ناموفق بود.</p>
              )}
              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setQrModalPatient(null)}
                >
                  <ArrowRight className="size-4 me-1" />
                  برگشت
                </Button>
                {qrModalImage && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = qrModalImage;
                        link.download = `qr-${qrModalPatient.firstName}-${qrModalPatient.lastName}.png`;
                        link.click();
                      }}
                    >
                      <Download className="size-4 me-1" />
                      دانلود QR کد
                    </Button>
                    <Button size="sm" className="rounded-lg" asChild>
                      <Link
                        href={`/patient/${qrModalPatient.qrCodeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setQrModalPatient(null)}
                      >
                        <ExternalLink className="size-4 me-1" />
                        مشاهده صفحه بیمار
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
