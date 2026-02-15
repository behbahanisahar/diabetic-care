# سامانه مراقبت دیابتی | Diabetic Care

سامانه جامع ثبت و مدیریت اطلاعات بیماران دیابتی در ایران با تولید QR کد منحصربه‌فرد برای هر بیمار.

## ویژگی‌ها

- **ثبت بیمار**: فرم کامل با نام، نام خانوادگی، کد ملی، شهر، محل سکونت، تاریخ تولد، آدرس، گروه خونی، نوع دیابت (۱ یا ۲)، لینک معاینه، تماس اضطراری و آپلود تصاویر کارت ملی و شناسنامه
- **QR کد یکتا**: هر بیمار یک QR کد منحصربه‌فرد دریافت می‌کند
- **جستجو و فیلتر**: جستجوی بیماران بر اساس نام، کد ملی، شهر و...
- **دانلود QR**: امکان دانلود QR کد هر بیمار
- **صفحه عمومی**: هنگام اسکن QR، اطلاعات بیمار به صورت خوانا نمایش داده می‌شود
- **امنیت**: تنها پرسنل پزشکی (با رمز عبور) می‌توانند داده‌ها را ویرایش کنند

## شهرها

لیست شهرهای ایران از API عمومی Divar دریافت می‌شود: `https://api.divar.ir/v8/places/cities`

## نصب و اجرا

```bash
# نصب وابستگی‌ها
npm install

# کپی فایل محیطی
cp .env.example .env

# تنظیم DATABASE_URL (PostgreSQL)
# برای توسعه محلی می‌توانید از Neon یا Docker استفاده کنید

# ساخت دیتابیس
npx prisma migrate deploy

# اجرای سرور توسعه
npm run dev
```

سپس به آدرس [http://localhost:3000](http://localhost:3000) مراجعه کنید.

## تنظیمات محیطی

فایل `.env` را ایجاد کنید (از `.env.example` کپی کنید):

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="رمز_عبور_مدیریت"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."  # برای آپلود فایل روی Vercel
```

## استقرار روی Vercel

1. **پوش آپدیت به GitHub**
2. **اتصال پروژه در Vercel**: Import repo در [vercel.com](https://vercel.com)
3. **افزودن دیتابیس PostgreSQL**:
   - Vercel Postgres (Storage > Create > Postgres)
   - یا Neon از [neon.tech](https://neon.tech)
4. **افزودن Vercel Blob**: Storage > Create > Blob
5. **متغیرهای محیطی**:
   - `DATABASE_URL` (از دیتابیس)
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
   - `BLOB_READ_WRITE_TOKEN` (از Blob store)
6. **Deploy**: پس از اولین دیپلوی، یک‌بار مایگریشن را اجرا کنید (از رایانه خود با همان `DATABASE_URL`): `npx prisma migrate deploy`

## ساختار پروژه

```
src/
├── app/
│   ├── admin/          # پنل مدیریت (ورود، لیست بیماران، فرم)
│   ├── api/            # API routes
│   ├── patient/[qrCodeId]/   # صفحه عمومی (اسکن QR)
│   └── page.tsx        # صفحه اصلی
├── lib/                # دیتابیس، احراز هویت، یوتیلیتی
```

## تکنولوژی‌ها

- **Frontend**: Next.js 16, React 19, Tailwind CSS, فونت وزیرمتن
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Cities API**: Divar Iran Locations API
