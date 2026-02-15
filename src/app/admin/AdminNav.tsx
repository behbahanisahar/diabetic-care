"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/admin" && !pathname.includes("patients")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-4">
        <Button
          variant={pathname === "/admin/patients" ? "secondary" : "ghost"}
          size="sm"
          className="rounded-xl"
          asChild
        >
          <Link href="/admin/patients">لیست بیماران</Link>
        </Button>
        <Button
          variant={pathname === "/admin/patients/new" ? "secondary" : "ghost"}
          size="sm"
          className="rounded-xl"
          asChild
        >
          <Link href="/admin/patients/new">ثبت بیمار جدید</Link>
        </Button>
      </div>
    </nav>
  );
}
