export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <main className="w-full max-w-2xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            موقع الأدوية
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            قاعدة بيانات أدوية قابلة للبحث مع صفحات ثابتة/سيرفر صديقة لمحركات البحث.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/drugs"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              فتح قاعدة البيانات
            </a>
            <a
              href="/drugs?q="
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              بحث سريع
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
