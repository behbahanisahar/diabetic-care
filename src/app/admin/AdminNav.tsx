"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  if (pathname === "/admin" && !pathname.includes("patients")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex gap-1">
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
        <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={handleLogout}>
          خروج
        </Button>
      </div>
    </nav>
  );
}
