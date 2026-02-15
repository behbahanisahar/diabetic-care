import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="size-8" />
          </span>
          <span className="text-sm font-semibold text-slate-900">مراقبت دیابتی</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            ورود
          </Link>
        </nav>
      </div>
    </header>
  );
}
