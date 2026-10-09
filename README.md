# همراه ۳۵۰

اپ شخصی فارسی برای رشد هدفمند در ۳۵۰ روز (PWA + اندروید با Capacitor).

## پیش‌نیاز
- Node.js 20+
- حساب GitHub

## راه‌اندازی
```bash
git clone <repo-url>
cd hamrah350
npm install
```

### فونت Vazirmatn (ضروری)
فایل‌های زیر را از [Vazirmatn Releases](https://github.com/rastikerdar/vazirmatn/releases) دانلود کرده و در `www/fonts/` قرار دهید:
- Vazirmatn-Regular.woff2
- Vazirmatn-Medium.woff2
- Vazirmatn-Bold.woff2

### آیکون
دو فایل PNG مربعی در `www/icons/` قرار دهید:
- icon-192.png
- icon-512.png

## ساخت APK اندروید
1. کد را به شاخه `main` پوش کنید.
2. در تب Actions ورک‌فلو «Build Android APK (debug)» اجرا می‌شود.
3. پس از اتمام، از Artifacts فایل `hamrah350-debug-apk` را دانلود کنید.
4. روی گوشی نصب کنید (Unknown sources را فعال کنید).
5. مجوز اعلان را بدهید و اپ را از بهینه‌سازی باتری خارج کنید.

## توسعه محلی
```bash
npx serve www
```
اپ کاملاً آفلاین کار می‌کند (به جز Gemini در صورت تنظیم کلید).

## ساختار
```
www/
  index.html
  manifest.webmanifest
  sw.js
  css/app.css
  js/
    app.js
    db.js
    jalali.js
    ui.js
    scoring.js
    ai.js
    gamification.js
    notify.js
    views/
  fonts/
  icons/
capacitor.config.json
package.json
scripts/patch-android.js
.github/workflows/android.yml
```

## نکات مهم
- کلید Gemini فقط روی دستگاه ذخیره می‌شود.
- اعلان‌ها فقط در نسخه APK کار می‌کنند.
- گزارش زمان استفاده از اپ‌ها به دلیل ریسک بالا پیاده‌سازی نشده است.
