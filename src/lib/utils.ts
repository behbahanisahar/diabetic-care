import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateQrCodeId(): string {
  return nanoid(12)
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const

export const DIABETES_TYPES = [
  { value: "none", label: "بدون دیابت" },
  { value: "type1", label: "دیابت نوع ۱" },
  { value: "type2", label: "دیابت نوع ۲" },
] as const

/** Persian ۰-۹ and Arabic ٠-٩ to ASCII 0-9 */
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert ASCII 0-9 to Persian ۰-۹ for display */
export function toPersianDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/** Convert Persian/Arabic/ASCII digits to ASCII 0-9 for search/storage */
export function normalizeToAsciiDigits(str: string): string {
  let result = "";
  for (const char of str) {
    const persianIdx = PERSIAN_DIGITS.indexOf(char);
    if (persianIdx >= 0) result += persianIdx;
    else {
      const arabicIdx = ARABIC_DIGITS.indexOf(char);
      if (arabicIdx >= 0) result += arabicIdx;
      else if (char >= "0" && char <= "9") result += char;
    }
  }
  return result;
}

/** Normalize search input so Persian/Arabic digits match ASCII-stored nationalId */
export function normalizeSearchForNationalId(search: string): string {
  return normalizeToAsciiDigits(search).replace(/\D/g, "");
}

/** Returns normalized 10-digit national ID or empty string if invalid */
export function normalizeIranianNationalId(nationalId: string): string {
  const cleaned = normalizeToAsciiDigits(nationalId).replace(/\D/g, "");
  if (cleaned.length < 8 || cleaned.length > 10) return "";
  const padded = cleaned.padStart(10, "0");
  return validateIranianNationalId(padded) ? padded : "";
}

/**
 * Validates Iranian National ID (کد ملی) - 10 digits with checksum
 * Accepts ASCII, Persian (۰-۹), and Arabic (٠-٩) digits.
 * Algorithm: https://fa.wikipedia.org/wiki/کد_ملی
 */
export function validateIranianNationalId(nationalId: string): boolean {
  const cleaned = normalizeToAsciiDigits(nationalId).replace(/\D/g, "");
  if (cleaned.length < 8 || cleaned.length > 10) return false;
  const padded = cleaned.padStart(10, "0");
  if (/^(\d)\1{9}$/.test(padded)) return false; // Reject 1111111111, 0000000000, etc.

  const digits = padded.split("").map(Number);
  const checkDigit = digits[9];
  const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
  const remainder = sum % 11;

  if (remainder < 2) return checkDigit === remainder;
  return checkDigit === 11 - remainder;
}
