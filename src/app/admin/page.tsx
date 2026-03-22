import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">لوحة التحكم</h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          إدارة المحتوى وإعدادات الموقع.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/drugs"
          className="rounded-3xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <div className="text-sm font-semibold">الأدوية</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">تعديل بيانات الأدوية</div>
        </Link>

        <Link
          href="/admin/articles"
          className="rounded-3xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <div className="text-sm font-semibold">المقالات</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">إنشاء ونشر مقالات SEO</div>
        </Link>

        <Link
          href="/admin/faq"
          className="rounded-3xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <div className="text-sm font-semibold">الأسئلة الشائعة</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">إضافة أسئلة وأجوبة لكل لغة</div>
        </Link>

        <Link
          href="/admin/settings"
          className="rounded-3xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <div className="text-sm font-semibold">الإعدادات</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">إعدادات الموقع + مفاتيح الترجمة</div>
        </Link>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="font-semibold">الأمان</div>
        <div className="mt-1 text-xs leading-6">
          هذه المنطقة محمية عبر Basic Auth باستخدام متغيرات البيئة <code>ADMIN_USER</code> و <code>ADMIN_PASS</code>.
        </div>
      </div>
    </div>
  );
}
