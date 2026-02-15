"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HeaderAuth({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  if (authenticated) {
    return (
      <Button variant="ghost" size="sm" className="rounded-xl text-slate-600 hover:text-primary" onClick={handleLogout}>
        خروج
      </Button>
    );
  }

  return (
    <Link
      href="/admin"
      className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
    >
      ورود
    </Link>
  );
}
