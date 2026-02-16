"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DatePicker from "react-multi-date-picker";
import type { Value } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toast } from "sonner";
import { BLOOD_TYPES, DIABETES_TYPES, validateIranianNationalId } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { cn, toPersianDigits } from "@/lib/utils";
import { createResizedPreview } from "@/lib/image-preview";

interface City {
  id: number;
  name: string;
  slug: string;
}

interface PatientFormProps {
  cities: City[];
  onSubmit: (formData: FormData) => void;
  loading?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  cancelHref?: string;
  cancelLabel?: string;
  initialData?: Partial<{
    firstName: string;
    lastName: string;
    nationalId: string;
    birthCertificateId: string;
    city: string;
    placeOfLiving: string;
    birthDate: string;
    address: string;
    bloodType: string;
    diabetesType: string;
    weightKg: string;
    heightCm: string;
    emergencyContact: string;
    emergencyContact2: string;
    treatingPhysician: string;
    notes: string;
  }>;
  initialNationalIdPhoto?: string;
  initialBirthCertificatePhoto?: string;
  /** URLs of existing educational files (for edit) */
  initialEducationalFiles?: string[];
  /** URLs of existing examination files (for edit) */
  initialExaminationFiles?: string[];
}

const formInputStyle = "h-11 w-full rounded-xl border-slate-200 bg-slate-50/50 px-3 py-2 transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";
const BLOOD_TYPE_EMPTY = "__none__";

export default function PatientForm({
  cities,
  onSubmit,
  loading = false,
  submitLabel = "ثبت و دریافت QR کد",
  loadingLabel = "در حال ثبت...",
  cancelHref,
  cancelLabel = "انصراف",
  initialData,
  initialNationalIdPhoto,
  initialBirthCertificatePhoto,
  initialEducationalFiles = [],
  initialExaminationFiles = [],
}: PatientFormProps) {
  const [birthDateValue, setBirthDateValue] = useState<Value>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(
    initialNationalIdPhoto || null
  );
  const [birthCertPreview, setBirthCertPreview] = useState<string | null>(
    initialBirthCertificatePhoto || null
  );
  const [nationalIdFileName, setNationalIdFileName] = useState<string | null>(null);
  const [birthCertFileName, setBirthCertFileName] = useState<string | null>(null);
  const [existingEducationalUrls, setExistingEducationalUrls] = useState<string[]>(initialEducationalFiles);
  const [existingExaminationUrls, setExistingExaminationUrls] = useState<string[]>(initialExaminationFiles);
  const [selectedEducationalFiles, setSelectedEducationalFiles] = useState<File[]>([]);
  const [selectedExaminationFiles, setSelectedExaminationFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialData?.birthDate) {
      setBirthDateValue(initialData.birthDate);
    }
  }, [initialData?.birthDate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const firstName = (formData.get("firstName") as string)?.trim() ?? "";
    const lastName = (formData.get("lastName") as string)?.trim() ?? "";
    const nationalId = (formData.get("nationalId") as string)?.trim() ?? "";
    const city = (formData.get("city") as string)?.trim() ?? "";
    if (!firstName) {
      toast.error("نام الزامی است.");
      return;
    }
    if (!lastName) {
      toast.error("نام خانوادگی الزامی است.");
      return;
    }
    if (!nationalId) {
      toast.error("کد ملی الزامی است.");
      return;
    }
    if (!validateIranianNationalId(nationalId)) {
      toast.error("کد ملی نامعتبر است. لطفاً ۱۰ رقم صحیح را وارد کنید.");
      return;
    }
    if (!city) {
      toast.error("شهر الزامی است.");
      return;
    }
    const hiddenBirth = form.elements.namedItem("birthDate") as HTMLInputElement;
    if (birthDateValue && hiddenBirth) {
      const d = birthDateValue as { format?: (s: string) => string; toDate?: () => Date };
      let dateStr = "";
      if (typeof d?.format === "function") {
        dateStr = d.format("YYYY-MM-DD") ?? "";
      }
      if (!dateStr && typeof (birthDateValue as Date).toISOString === "function") {
        dateStr = (birthDateValue as Date).toISOString().slice(0, 10);
      }
      if (!dateStr && typeof d?.toDate === "function") {
        const native = d.toDate();
        if (native && typeof native.toISOString === "function") dateStr = native.toISOString().slice(0, 10);
      }
      if (typeof birthDateValue === "string") dateStr = birthDateValue.slice(0, 10);
      if (dateStr) hiddenBirth.value = dateStr;
    }
    const rawFormData = new FormData(form);
    const submitData = new FormData();
    for (const [key, value] of rawFormData.entries()) {
      if (key === "educationalFiles" || key === "examinationFiles") continue;
      if (value instanceof File) submitData.append(key, value);
      else submitData.set(key, value as string);
    }
    selectedEducationalFiles.forEach((f) => submitData.append("educationalFiles", f));
    selectedExaminationFiles.forEach((f) => submitData.append("examinationFiles", f));
    if (submitData.get("bloodType") === BLOOD_TYPE_EMPTY) submitData.set("bloodType", "");
    onSubmit(submitData);
  };

  const handleNationalIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (nationalIdPreview?.startsWith("blob:")) URL.revokeObjectURL(nationalIdPreview);
    if (file) {
      setNationalIdFileName(file.name);
      createResizedPreview(file)
        .then(setNationalIdPreview)
        .catch(() => setNationalIdPreview(URL.createObjectURL(file)));
    } else {
      setNationalIdPreview(initialNationalIdPhoto || null);
      setNationalIdFileName(null);
    }
  };

  const handleBirthCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (birthCertPreview?.startsWith("blob:")) URL.revokeObjectURL(birthCertPreview);
    if (file) {
      setBirthCertFileName(file.name);
      createResizedPreview(file)
        .then(setBirthCertPreview)
        .catch(() => setBirthCertPreview(URL.createObjectURL(file)));
    } else {
      setBirthCertPreview(initialBirthCertificatePhoto || null);
      setBirthCertFileName(null);
    }
  };

  useEffect(() => {
    return () => {
      if (nationalIdPreview?.startsWith("blob:")) URL.revokeObjectURL(nationalIdPreview);
      if (birthCertPreview?.startsWith("blob:")) URL.revokeObjectURL(birthCertPreview);
    };
  }, [nationalIdPreview, birthCertPreview]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate encType="multipart/form-data">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام *</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialData?.firstName}
                placeholder="نام"
                className={formInputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی *</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialData?.lastName}
                placeholder="نام خانوادگی"
                className={formInputStyle}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nationalId">کد ملی *</Label>
              <Input
                id="nationalId"
                name="nationalId"
                defaultValue={initialData?.nationalId}
                maxLength={10}
                inputMode="numeric"
                placeholder="۱۲۳۴۵۶۷۸۹۰"
                className={formInputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthCertificateId">شماره شناسنامه</Label>
              <Input
                id="birthCertificateId"
                name="birthCertificateId"
                defaultValue={initialData?.birthCertificateId}
                placeholder="شماره شناسنامه"
                className={formInputStyle}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">شهر *</Label>
              <Combobox
                name="city"
                items={cities}
                itemToStringValue={(c) => c.name}
                itemToStringLabel={(c) => c.name}
                defaultValue={initialData?.city ? cities.find((c) => c.name === initialData?.city) ?? null : null}
              >
                <ComboboxInput showClear className="form-field-base" placeholder="انتخاب یا جستجوی شهر" dir="rtl" />
                <ComboboxContent dir="rtl">
                  <ComboboxEmpty>شهری یافت نشد</ComboboxEmpty>
                  <ComboboxList>
                    {(city) => (
                      <ComboboxItem key={city.id} value={city}>{city.name}</ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeOfLiving">محل سکونت</Label>
              <Input
                id="placeOfLiving"
                name="placeOfLiving"
                defaultValue={initialData?.placeOfLiving}
                placeholder="محل سکونت"
                className={formInputStyle}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>تاریخ تولد</Label>
              <input type="hidden" name="birthDate" id="birthDate" />
              <DatePicker
                value={birthDateValue}
                onChange={(val) => setBirthDateValue(val)}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm"
                containerClassName="w-full"
                className="teal"
                calendarPosition="bottom-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">گروه خونی</Label>
              <Select name="bloodType" defaultValue={initialData?.bloodType || BLOOD_TYPE_EMPTY}>
                <SelectTrigger className="form-field-base" dir="rtl">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value={BLOOD_TYPE_EMPTY}>انتخاب کنید</SelectItem>
                  {BLOOD_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={initialData?.address}
              rows={3}
              placeholder="آدرس کامل"
              className={formInputStyle}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diabetesType">نوع دیابت</Label>
            <Select name="diabetesType" defaultValue={initialData?.diabetesType || "none"}>
<SelectTrigger className="form-field-base" dir="rtl">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {DIABETES_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weightKg">وزن (کیلوگرم)</Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                step="0.1"
                min="0"
                placeholder="مثلاً 70"
                defaultValue={initialData?.weightKg}
                className={formInputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm">قد (سانتی‌متر)</Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                step="1"
                min="0"
                placeholder="مثلاً 170"
                defaultValue={initialData?.heightCm}
                className={formInputStyle}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">تماس اضطراری ۱</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              defaultValue={initialData?.emergencyContact}
              placeholder="شماره تماس"
              className={formInputStyle}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact2">تماس اضطراری ۲ (اختیاری)</Label>
            <Input
              id="emergencyContact2"
              name="emergencyContact2"
              defaultValue={initialData?.emergencyContact2}
              placeholder="شماره دوم"
              className={formInputStyle}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatingPhysician">پزشک معالج</Label>
            <Input
              id="treatingPhysician"
              name="treatingPhysician"
              defaultValue={initialData?.treatingPhysician}
              placeholder="نام پزشک معالج"
              className={formInputStyle}
            />
          </div>

          <div className="space-y-2">
            <Label>فایل‌های آموزشی (چند فایل)</Label>
            <input type="hidden" name="existingEducationalFiles" value={JSON.stringify(existingEducationalUrls)} />
            <label
              className={cn(
                "flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm hover:border-primary/50 hover:bg-primary/5",
                "text-slate-700"
              )}
              dir="rtl"
            >
              <Upload className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  setSelectedEducationalFiles((p) => [...p, ...files]);
                  e.target.value = "";
                }}
              />
              <span className="flex-1 truncate text-start">انتخاب یک یا چند فایل (عکس، PDF، Word و...)</span>
            </label>
            {existingEducationalUrls.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm">
                {existingEducationalUrls.map((url) => (
                  <li key={url} className="flex items-center justify-between gap-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
                      فایل آموزشی
                    </a>
                    <button
                      type="button"
                      className="shrink-0 text-destructive hover:underline"
                      onClick={() => setExistingEducationalUrls((p) => p.filter((u) => u !== url))}
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedEducationalFiles.length > 0 && (
              <ul className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm">
                {selectedEducationalFiles.map((file, index) => (
                  <FilePreviewItem
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => setSelectedEducationalFiles((p) => p.filter((_, i) => i !== index))}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label>فایل‌های سونوگرافی / معاینه (چند فایل)</Label>
            <input type="hidden" name="existingExaminationFiles" value={JSON.stringify(existingExaminationUrls)} />
            <label
              className={cn(
                "flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm hover:border-primary/50 hover:bg-primary/5",
                "text-slate-700"
              )}
              dir="rtl"
            >
              <Upload className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  setSelectedExaminationFiles((p) => [...p, ...files]);
                  e.target.value = "";
                }}
              />
              <span className="flex-1 truncate text-start">انتخاب یک یا چند فایل (عکس، PDF، Word و...)</span>
            </label>
            {existingExaminationUrls.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm">
                {existingExaminationUrls.map((url) => (
                  <li key={url} className="flex items-center justify-between gap-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
                      فایل معاینه
                    </a>
                    <button
                      type="button"
                      className="shrink-0 text-destructive hover:underline"
                      onClick={() => setExistingExaminationUrls((p) => p.filter((u) => u !== url))}
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedExaminationFiles.length > 0 && (
              <ul className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm">
                {selectedExaminationFiles.map((file, index) => (
                  <FilePreviewItem
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => setSelectedExaminationFiles((p) => p.filter((_, i) => i !== index))}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalIdPhoto">تصویر کارت ملی (اختیاری)</Label>
            <label
              htmlFor="nationalIdPhoto"
              className={cn(
                "flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
                "text-slate-700"
              )}
              dir="rtl"
            >
              <Upload className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
              <input
                id="nationalIdPhoto"
                name="nationalIdPhoto"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleNationalIdFileChange}
              />
              <span className="flex-1 truncate text-start">
                {nationalIdFileName ?? (nationalIdPreview ? "تصویر قبلی" : "برای انتخاب فایل کلیک کنید")}
              </span>
            </label>
            {nationalIdPreview && (
              <div className="mt-2">
                <img
                  src={nationalIdPreview}
                  alt="پیش‌نمایش کارت ملی"
                  className="max-h-40 rounded-xl border object-contain"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthCertificatePhoto">تصویر شناسنامه (اختیاری)</Label>
            <label
              htmlFor="birthCertificatePhoto"
              className={cn(
                "flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
                "text-slate-700"
              )}
              dir="rtl"
            >
              <Upload className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
              <input
                id="birthCertificatePhoto"
                name="birthCertificatePhoto"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleBirthCertFileChange}
              />
              <span className="flex-1 truncate text-start">
                {birthCertFileName ?? (birthCertPreview ? "تصویر قبلی" : "برای انتخاب فایل کلیک کنید")}
              </span>
            </label>
            {birthCertPreview && (
              <div className="mt-2">
                <img
                  src={birthCertPreview}
                  alt="پیش‌نمایش شناسنامه"
                  className="max-h-40 rounded-xl border object-contain"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">توضیحات</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes}
              rows={2}
              placeholder="توضیحات اضافی"
              className={formInputStyle}
            />
          </div>

          <div className={cn("flex gap-3", cancelHref ? "flex-row-reverse" : "")}>
            <Button type="submit" className={cn("h-12 rounded-xl font-medium", cancelHref ? "flex-1" : "w-full")} size="lg" disabled={loading}>
              {loading ? loadingLabel : submitLabel}
            </Button>
            {cancelHref && (
              <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl font-medium" size="lg" asChild>
                <Link href={cancelHref}>{cancelLabel}</Link>
              </Button>
            )}
          </div>
        </form>
    </div>
  );
}

function FilePreviewItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
      {isImage && previewUrl ? (
        <div className="size-12 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-100">
          <FileText className="size-6 text-slate-500" />
        </div>
      )}
      <span className="min-w-0 flex-1 truncate text-slate-700" title={file.name}>
        {file.name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1.5 text-destructive hover:bg-destructive/10"
        title="حذف"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
