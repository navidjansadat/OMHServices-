# OMH Social Services — Rebuilt

نسخه بازسازی‌شده پروژه OMH با تمرکز روی امنیت، پنل مدیریت، فیلتر سرویس‌ها و آپلود تصاویر.

## قابلیت‌های اصلی
- احراز هویت ادمین با session cookie و bcrypt؛ رمزهای قدیمی plain-text در اولین ورود موفق به bcrypt تبدیل می‌شوند.
- محافظت تمام APIهای مدیریتی با middleware احراز هویت.
- rate limit برای ورود و عملیات نوشتن.
- مدیریت کامل دسته‌بندی، زیردسته، سرویس، نظرات، نشرات و اعلان‌ها.
- فیلتر صحیح Category → Subcategory → Service و جستجوی ترکیبی.
- حذف/ویرایش امن‌تر و جلوگیری از حذف دسته‌ای که وابستگی فعال دارد.
- جلوگیری از XSS در رندر عمومی محتوا با textContent/escaping.
- آپلود لوگوی سایت و تصویر سرویس در Supabase Storage با preview و حذف/تعویض.
- تنظیمات عمومی با allowlist و URL validation.
- هدرهای پایه امنیتی و عدم نمایش جزئیات خطای دیتابیس به کاربر.

## راه‌اندازی
1. `npm install`
2. متغیرهای `env.example.txt` را در `.env` تنظیم کنید.
3. حتماً `SUPABASE_SERVICE_ROLE_KEY` را فقط روی سرور قرار دهید و هرگز داخل frontend نگذارید.
4. در Supabase یک Storage Bucket با نام `omh-assets` (یا مقدار `SUPABASE_STORAGE_BUCKET`) بسازید و برای فایل‌های public، دسترسی خواندن عمومی را تنظیم کنید. آپلود/حذف فقط از طریق backend انجام می‌شود.
5. `FRONTEND_ORIGINS` را با دامنه واقعی سایت تنظیم کنید.
6. `npm start`

## نکته دیتابیس
کد بازسازی‌شده از همان جدول‌ها و ستون‌های پروژه اولیه استفاده می‌کند: `admins`, `categories`, `subcategories`, `services`, `reviews`, `announcements`, `settings`, `posts`.
ستون‌های مورد استفاده برای سرویس‌ها شامل `image`, `icon`, `short_description`, `unit`, `delivery_time`, `guarantee`, `is_featured`, `order`, `views` است؛ تنظیمات می‌تواند `logo_url` را به‌عنوان یک key/value نگه دارد.
اگر RLS روی جداول فعال است، backend باید با Service Role Key اجرا شود.

## مسیرهای مهم
- `/` سایت عمومی
- `/admin` ورود مدیریت
- `/admin/dashboard` داشبورد
