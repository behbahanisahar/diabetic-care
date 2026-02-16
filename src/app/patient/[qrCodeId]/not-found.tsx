import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-slate-800">اطلاعات یافت نشد</h1>
      <p className="text-slate-600">QR کد معتبر نیست یا منقضی شده است.</p>
      <BackButton className="rounded-xl" />
    </div>
  );
}
