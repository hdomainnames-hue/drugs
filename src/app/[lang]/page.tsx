import Link from "next/link";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <main className="w-full max-w-2xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {t(lang, "homeTitle")}
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {t(lang, "homeSubtitle")}
              </p>
            </div>

            <Link
              href={lang === "ar" ? "/en" : "/ar"}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${lang}/drugs`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {t(lang, "openDatabase")}
            </Link>
            <Link
              href={`/${lang}/drugs?q=`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              {t(lang, "quickSearch")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
