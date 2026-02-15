import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { HeaderAuth } from "./header-auth";

export async function SiteHeader() {
  const authenticated = await isAdminAuthenticated();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-8 shrink-0" aria-hidden />
          <span className="text-sm font-semibold text-slate-900">اطلاعات بیماران دیابتی</span>
        </Link>
        <nav className="flex items-center gap-4">
          <HeaderAuth authenticated={authenticated} />
        </nav>
      </div>
    </header>
  );
}
