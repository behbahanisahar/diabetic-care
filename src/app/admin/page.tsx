"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("رمز عبور الزامی است.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "خطا در ورود");
        return;
      }
      router.push("/admin/patients");
      router.refresh();
    } catch {
      toast.error("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <svg className="size-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ورود به پنل</h1>
            <p className="mt-1 text-sm text-muted-foreground">سامانه مراقبت دیابتی</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور را وارد کنید"
                autoFocus
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-start transition-colors focus:bg-white"
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl font-medium"
              size="lg"
              disabled={loading}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
