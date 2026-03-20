import Link from "next/link";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import ThemeToggle from "@/components/theme-toggle";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      lang={lang}
      className="min-h-full flex flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50"
    >
      <header className="sticky top-0 z-20 border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/60 dark:bg-black/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href={`/${lang}`} className="text-sm font-semibold tracking-tight">
            {t(lang, "siteName")}
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle lightLabel={t(lang, "themeLight")} darkLabel={t(lang, "themeDark")} />

            <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link
              href={`/${lang}`}
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {t(lang, "homeNav")}
            </Link>
            <Link
              href={`/${lang}/drugs`}
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {t(lang, "drugsNav")}
            </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-zinc-50/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80 sm:hidden">
        <div className="mx-auto grid h-16 w-full max-w-5xl grid-cols-2 px-4">
          <Link
            href={`/${lang}`}
            className="flex flex-col items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t(lang, "homeNav")}
          </Link>
          <Link
            href={`/${lang}/drugs`}
            className="flex flex-col items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t(lang, "drugsNav")}
          </Link>
        </div>
      </nav>

      <div className="h-16 sm:hidden" />
    </div>
  );
}
