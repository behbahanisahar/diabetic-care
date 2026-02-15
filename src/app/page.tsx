import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, FileText, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-16 sm:pt-24 sm:pb-20">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium tracking-widest text-primary/80">سامانه مراقبت دیابتی ایران</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              مدیریت بیماران
              <br />
              <span className="bg-gradient-to-l from-primary to-cyan-600 bg-clip-text text-transparent">
                با QR کد یکتا
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600 leading-relaxed">
              ثبت اطلاعات بیمار، تولید QR کد منحصربه‌فرد و دسترسی سریع خانواده و امدادگران به اطلاعات پزشکی
            </p>
            <Button
              size="lg"
              className="mt-10 h-12 rounded-2xl px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
              asChild
            >
              <Link href="/admin">ورود به پنل مدیریت</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 pt-6 pb-20 sm:pt-8 sm:pb-24">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">چرا این سامانه؟</h2>
            <p className="mt-2 text-sm text-slate-500">ابزار ساده و حرفه‌ای برای مراکز درمانی</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div className="group flex flex-col items-center text-center sm:items-start sm:text-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <FileText className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">ثبت استاندارد</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                فرم کامل با تمام فیلدهای لازم برای اطلاعات پزشکی و مدارک بیماران
              </p>
            </div>
            <div className="group flex flex-col items-center text-center sm:items-start sm:text-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <QrCode className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">QR کد یکتا</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                هر بیمار QR کد منحصربه‌فرد دارد. اسکن و دسترسی آنی در شرایط اضطراری
              </p>
            </div>
            <div className="group flex flex-col items-center text-center sm:items-start sm:text-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Shield className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">امن و محرمانه</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                ورود با رمز عبور. فقط پرسنل مجاز به ویرایش
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">آماده شروع هستید؟</h2>
            <p className="mt-4 text-slate-500">وارد پنل مدیریت شوید و اولین بیمار را ثبت کنید</p>
            <Button
              className="mt-8 h-12 rounded-2xl px-10 font-semibold"
              asChild
            >
              <Link href="/admin">ورود به پنل مدیریت</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
