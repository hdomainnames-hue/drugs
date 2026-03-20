# ملف المهام — موقع الأدوية (SEO + AdSense) — عربي/إنجليزي — Next.js + Vercel + Neon

> هذا الملف قابل للتعليم (Checkboxes). قم بتحديثه أثناء التنفيذ.

## مرحلة 0 — تهيئة المشروع وهوية الموقع
- [ ] اختيار اسم الدومين النهائي + التأكد من توافره
- [ ] تحديد اسم العلامة التجارية (AR/EN)
- [ ] تصميم Logo بسيط (SVG) + نسخة صغيرة للأيقونات
- [ ] تجهيز أيقونات الموقع:
  - [ ] `favicon.ico`
  - [ ] `icon-192.png`
  - [ ] `icon-512.png`
  - [ ] `apple-touch-icon.png`
  - [ ] `site.webmanifest`
- [ ] تحديد لوحة ألوان (Dark/Light) مع تباين جيد
- [ ] اختيار الخطوط:
  - [ ] عربي: خط واضح (مثال: Cairo / Tajawal)
  - [ ] إنجليزي: Inter

## مرحلة 1 — إنشاء مشروع Next.js (مستقل)
- [ ] إنشاء المشروع داخل `c:\web\drugs`
- [ ] إعداد TypeScript
- [ ] إعداد ESLint/Prettier
- [ ] إعداد TailwindCSS
- [ ] إعداد نظام الثيم (Light/Dark)
- [ ] إعداد RTL للعربية (dir + styling)
- [ ] إعداد i18n routing:
  - [ ] `/ar` و`/en`
  - [ ] مبدلات اللغة + حفظ الاختيار
- [ ] إنشاء مكونات UI الأساسية:
  - [ ] Navbar (Desktop)
  - [ ] Bottom Navigation (Mobile)
  - [ ] Search Box
  - [ ] Drug Card
  - [ ] Pagination

## مرحلة 2 — Neon Postgres + ORM
- [ ] إنشاء مشروع Neon Postgres
- [ ] حفظ متغيرات البيئة في Vercel و`.env.local`:
  - [ ] `DATABASE_URL`
- [ ] إعداد Prisma (أو Drizzle) وربطه بـ Neon
- [ ] تصميم Schema:
  - [ ] drugs
  - [ ] drug_similar
  - [ ] articles
  - [ ] faqs
- [ ] إضافة Indexes للبحث
- [ ] Migration وتشغيلها

## مرحلة 3 — نقل البيانات من SQLite إلى Neon
- [ ] قرار استراتيجية الصور (مؤقت/نهائي)
- [ ] سكربت Export من SQLite:
  - [ ] drugs
  - [ ] drug_similar
- [ ] سكربت Import إلى Neon
- [ ] التحقق من العدادات:
  - [ ] COUNT drugs
  - [ ] COUNT drug_similar
- [ ] توليد slugs (AR/EN) ثابتة + منع التعارض

## مرحلة 4 — صفحات SEO الأساسية (SSR/SSG/ISR)
- [ ] الصفحة الرئيسية (AR/EN)
- [ ] صفحة دواء (AR/EN):
  - [ ] بيانات أساسية + صورة
  - [ ] قسم مشابهات (من drug_similar)
  - [ ] FAQ (مبدئي)
  - [ ] Disclaimer طبي واضح
- [ ] صفحة شركة (AR/EN)
- [ ] صفحة مادة فعالة (AR/EN)
- [ ] صفحة المقالات (AR/EN)
- [ ] صفحة مقال (AR/EN)

## مرحلة 5 — البحث والتصفح
- [ ] صفحة بحث (AR/EN) + فلاتر
- [ ] noindex لصفحات البحث
- [ ] بحث سريع (Autocomplete) — مرحلة 1:
  - [ ] بحث بسيط على السيرفر أو client-side index

## مرحلة 6 — SEO تقني
- [ ] Titles/Descriptions لكل صفحة
- [ ] Canonical + Hreflang
- [ ] OpenGraph + Twitter cards
- [ ] JSON-LD:
  - [ ] BreadcrumbList
  - [ ] FAQPage
- [ ] Sitemap Index + تقسيم:
  - [ ] drugs
  - [ ] companies
  - [ ] active ingredients
  - [ ] articles
- [ ] robots.txt
- [ ] صفحة 404 محترمة

## مرحلة 7 — صفحات الثقة (AdSense)
- [ ] About (AR/EN)
- [ ] Contact (AR/EN)
- [ ] Privacy Policy (AR/EN)
- [ ] Terms (AR/EN)
- [ ] Medical Disclaimer (AR/EN)

## مرحلة 8 — الأداء (Core Web Vitals)
- [ ] تحسين الصور (WebP/AVIF)
- [ ] Lazy load لما يلزم فقط
- [ ] تقليل JS على صفحات الدواء
- [ ] Caching headers

## مرحلة 9 — المحتوى الأصلي (SEO + E-E-A-T)
- [ ] إنشاء خطة محتوى (Topics) بالعربي والإنجليزي
- [ ] كتابة 20 مقال عربي كبداية
- [ ] كتابة/ترجمة 10 مقالات إنجليزية كبداية
- [ ] إضافة FAQ لكل دواء (حد أدنى 3 أسئلة)
- [ ] إضافة مصادر/مراجع عامة (بدون ادعاءات طبية خطرة)

## مرحلة 10 — الإطلاق والمراقبة
- [ ] إعداد Google Search Console
- [ ] ربط Analytics (حل مجاني)
- [ ] إعداد AdSense بعد تجهيز الصفحات والسياسات والمحتوى
- [ ] مراقبة أخطاء الزحف 404/500
- [ ] تحسينات أسبوعية بناءً على الأداء
