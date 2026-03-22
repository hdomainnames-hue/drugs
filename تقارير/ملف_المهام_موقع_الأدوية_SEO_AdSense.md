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
  - [x] `site.webmanifest`
- [ ] تحديد لوحة ألوان (Dark/Light) مع تباين جيد
- [ ] اختيار الخطوط:
  - [ ] عربي: خط واضح (مثال: Cairo / Tajawal)
  - [ ] إنجليزي: Inter

## مرحلة 1 — إنشاء مشروع Next.js (مستقل)
- [x] إنشاء المشروع داخل `c:\web\drugs`
- [x] إعداد TypeScript
- [x] إعداد ESLint/Prettier
- [x] إعداد TailwindCSS
- [x] إعداد نظام الثيم (Light/Dark)
- [x] إعداد RTL للعربية (dir + styling)
- [x] إعداد i18n routing:
  - [x] `/ar` و`/en`
  - [x] مبدلات اللغة + حفظ الاختيار
- [x] إنشاء مكونات UI الأساسية:
  - [x] Navbar (Desktop)
  - [x] Bottom Navigation (Mobile)
  - [x] Search Box
  - [x] Drug Card
  - [x] Pagination

## مرحلة 2 — Neon Postgres + ORM
- [x] إنشاء مشروع Neon Postgres
- [x] حفظ متغيرات البيئة في Vercel و`.env.local`:
  - [x] `DATABASE_URL`
- [x] إعداد Prisma (أو Drizzle) وربطه بـ Neon
- [x] تصميم Schema:
  - [x] drugs
  - [x] drug_similar
  - [x] articles
  - [x] faqs
- [x] إضافة Indexes للبحث
- [x] Migration وتشغيلها

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
- [x] الصفحة الرئيسية (AR/EN)
- [x] صفحة دواء (AR/EN):
  - [x] بيانات أساسية + صورة
  - [x] قسم مشابهات (من drug_similar)
  - [x] FAQ (مبدئي)
  - [x] Disclaimer طبي واضح
- [x] صفحة شركة (AR/EN)
- [x] صفحة مادة فعالة (AR/EN)
- [x] صفحة المقالات (AR/EN)
- [x] صفحة مقال (AR/EN)

## مرحلة 5 — البحث والتصفح
- [ ] صفحة بحث (AR/EN) + فلاتر
- [x] noindex لصفحات البحث
- [ ] بحث سريع (Autocomplete) — مرحلة 1:
  - [ ] بحث بسيط على السيرفر أو client-side index

## مرحلة 6 — SEO تقني
- [x] Titles/Descriptions لكل صفحة
- [x] Canonical + Hreflang
- [x] OpenGraph + Twitter cards
- [x] JSON-LD:
  - [x] BreadcrumbList
  - [ ] FAQPage
- [x] Sitemap Index + تقسيم:
  - [x] drugs
  - [x] companies
  - [x] active ingredients
  - [x] articles
- [x] robots.txt
- [x] صفحة 404 محترمة

## مرحلة 7 — صفحات الثقة (AdSense)
- [x] About (AR/EN)
- [x] Contact (AR/EN)
- [x] Privacy Policy (AR/EN)
- [x] Terms (AR/EN)
- [x] Medical Disclaimer (AR/EN)

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
