import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-6 text-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="size-6" />
            </span>
            <span className="text-sm font-medium text-slate-700">سامانه مراقبت دیابتی ایران</span>
          </Link>
          <p className="text-xs text-slate-500">
            مدیریت بیماران با QR کد یکتا
          </p>
        </div>
      </div>
    </footer>
  );
}
