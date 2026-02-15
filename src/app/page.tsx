import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, FileText, Shield, ArrowLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero – content-sized, less top/bottom space */}
      <header className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        {/* Blurry bubbles – sharp, accessible colors (navy/blue) */}
        <div className="absolute inset-0 bg-white" aria-hidden />
        <div className="absolute left-[8%] top-[12%] h-32 w-32 rounded-full bg-[#0c4a6e] blur-2xl sm:h-44 sm:w-44 sm:blur-3xl" aria-hidden style={{ opacity: 0.5 }} />
        <div className="absolute right-[12%] top-[8%] h-24 w-24 rounded-full bg-[#1e40af] blur-2xl sm:h-36 sm:w-36" aria-hidden style={{ opacity: 0.45 }} />
        <div className="absolute bottom-[18%] right-[10%] h-40 w-40 rounded-full bg-[#0f172a] blur-3xl sm:h-52 sm:w-52 sm:blur-[40px]" aria-hidden style={{ opacity: 0.5 }} />
        <div className="absolute bottom-[25%] left-[15%] h-28 w-28 rounded-full bg-[#0c4a6e] blur-2xl sm:h-36 sm:w-36 sm:blur-3xl" aria-hidden style={{ opacity: 0.5 }} />
        <div className="absolute left-[45%] top-[22%] h-20 w-20 rounded-full bg-[#164e63] blur-xl sm:h-28 sm:w-28 sm:blur-2xl" aria-hidden style={{ opacity: 0.45 }} />
        <div className="absolute right-[28%] bottom-[12%] h-36 w-36 rounded-full bg-[#1e40af] blur-2xl sm:h-44 sm:w-44 sm:blur-3xl" aria-hidden style={{ opacity: 0.4 }} />
        <div className="absolute left-[22%] top-[55%] h-24 w-24 rounded-full bg-[#0f172a] blur-2xl sm:h-32 sm:w-32" aria-hidden style={{ opacity: 0.45 }} />
        <div className="absolute right-[5%] top-[45%] h-20 w-20 rounded-full bg-[#0c4a6e] blur-xl sm:h-28 sm:w-28 sm:blur-2xl" aria-hidden style={{ opacity: 0.45 }} />
        <div className="absolute left-[70%] top-[70%] h-32 w-32 rounded-full bg-[#0c4a6e] blur-2xl sm:h-40 sm:w-40 sm:blur-3xl" aria-hidden style={{ opacity: 0.4 }} />
        <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden />
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 sm:flex-row sm:gap-10 sm:text-start">
          <div className="min-w-0 flex-1 space-y-4 text-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 sm:text-sm">
              سامانه مراقبت دیابتی ایران
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              مدیریت بیماران
              <br />
              <span className="text-[#0c4a6e]">با QR کد یکتا</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700">
              ثبت اطلاعات بیمار، تولید QR کد منحصربه‌فرد و دسترسی سریع خانواده و امدادگران به اطلاعات پزشکی
            </p>
            <Button
              size="lg"
              className="mt-1 h-12 rounded-2xl bg-[#0c4a6e] px-8 text-base font-semibold text-white shadow-lg transition hover:bg-[#0e7490] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#0c4a6e] focus-visible:ring-offset-2"
              asChild
            >
              <Link href="/admin" className="inline-flex items-center gap-2">
                ورود به پنل مدیریت
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="flex shrink-0 items-center justify-center overflow-hidden">
            {/* Animated QR (hero.svg – scan line animation) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero.svg?v=2"
              alt="QR کد یکتا"
              className="h-72 w-72 object-cover object-[50%_35%] sm:h-96 sm:w-96 lg:h-[26rem] lg:w-[26rem]"
            />
          </div>
        </div>
      </header>

      {/* Features – clean cards */}
      <section className="border-t border-slate-200/80 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">چرا این سامانه؟</h2>
            <p className="mt-3 text-slate-700">ابزار ساده و حرفه‌ای برای مراکز درمانی</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-3 sm:gap-8">
            <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-start transition-all hover:border-sky-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#0c4a6e]/15 text-[#0c4a6e] transition-colors group-hover:bg-[#0c4a6e]/20">
                <FileText className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">ثبت استاندارد</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                فرم کامل با تمام فیلدهای لازم برای اطلاعات پزشکی و مدارک بیماران
              </p>
            </div>
            <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-start transition-all hover:border-sky-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#0c4a6e]/15 text-[#0c4a6e] transition-colors group-hover:bg-[#0c4a6e]/20">
                <QrCode className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">QR کد یکتا</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                هر بیمار QR کد منحصربه‌فرد دارد. اسکن و دسترسی آنی در شرایط اضطراری
              </p>
            </div>
            <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-start transition-all hover:border-sky-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#0c4a6e]/15 text-[#0c4a6e] transition-colors group-hover:bg-[#0c4a6e]/20">
                <Shield className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">امن و محرمانه</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                ورود با رمز عبور. فقط پرسنل مجاز به ویرایش
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-100 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">آماده شروع هستید؟</h2>
          <p className="mt-3 text-slate-700">وارد پنل مدیریت شوید و اولین بیمار را ثبت کنید</p>
          <Button
            className="mt-8 h-12 rounded-2xl bg-[#0c4a6e] px-8 font-semibold text-white shadow-lg transition hover:bg-[#0e7490] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#0c4a6e] focus-visible:ring-offset-2"
            asChild
          >
            <Link href="/admin">ورود به پنل مدیریت</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
