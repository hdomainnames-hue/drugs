import Link from "next/link";
import type { Metadata } from "next";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import ThemeToggle from "@/components/theme-toggle";
import NavLink from "@/components/nav-link";
import LanguageToggle from "@/components/language-toggle";
import MobileMenu from "@/components/mobile-menu";
import NavbarSearch from "@/components/navbar-search";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const title = t(lang, "siteName");
  const description = t(lang, "homeSubtitle");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const metadataBase = baseUrl ? new URL(baseUrl) : undefined;

  return {
    title,
    description,
    metadataBase,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${lang}`,
      siteName: title,
      locale: lang === "ar" ? "ar" : "en",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

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
      <header className="sticky top-0 z-20 border-b border-zinc-200/60 bg-zinc-100/80 backdrop-blur dark:border-zinc-800/60 dark:bg-black/70">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M10 7a6 6 0 1 1 8 10l-3 3a6 6 0 1 1-8-10l3-3Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.5 10.5 13.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t(lang, "siteName")}
          </Link>

          <div className="flex items-center gap-2">
            {lang === "ar" ? (
              <>
                <nav className="hidden items-center gap-4 text-sm sm:flex">
                  <NavLink
                    href={`/${lang}`}
                    exact
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "homeNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/drugs`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "drugsNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/companies`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "companiesTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/active-ingredients`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "activeIngredientsTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/articles`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "articlesNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/faq`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "faqNav")}
                  </NavLink>
                </nav>

                <div className="flex items-center gap-2">
                  <NavbarSearch lang={lang} />
                  <Link
                    href={`/${lang}/contact`}
                    aria-label={t(lang, "footerContact")}
                    title={t(lang, "footerContact")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 4h16v16H4V4Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <LanguageToggle lang={lang} />
                  <ThemeToggle lightLabel={t(lang, "themeLight")} darkLabel={t(lang, "themeDark")} />
                  <MobileMenu lang={lang} />
                </div>
              </>
            ) : (
              <>
                <nav className="hidden items-center gap-4 text-sm sm:flex">
                  <NavLink
                    href={`/${lang}`}
                    exact
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "homeNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/drugs`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "drugsNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/companies`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "companiesTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/active-ingredients`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "activeIngredientsTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/articles`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "articlesNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/faq`}
                    className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-zinc-100 text-zinc-950 dark:bg-zinc-900/60 dark:text-zinc-50"
                  >
                    {t(lang, "faqNav")}
                  </NavLink>
                </nav>

                <div className="flex items-center gap-2">
                  <NavbarSearch lang={lang} />
                  <Link
                    href={`/${lang}/contact`}
                    aria-label={t(lang, "footerContact")}
                    title={t(lang, "footerContact")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 4h16v16H4V4Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <LanguageToggle lang={lang} />
                  <ThemeToggle lightLabel={t(lang, "themeLight")} darkLabel={t(lang, "themeDark")} />
                  <MobileMenu lang={lang} />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M10 7a6 6 0 1 1 8 10l-3 3a6 6 0 1 1-8-10l3-3Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.5 10.5 13.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(lang, "siteName")}
              </div>
              <div className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">{t(lang, "homeSubtitle")}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link
                href={`/${lang}/about`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(lang, "footerAbout")}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L9 10.5a16 16 0 0 0 4.5 4.5l1.17-1.14a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(lang, "footerContact")}
              </Link>
              <Link
                href={`/${lang}/privacy`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(lang, "footerPrivacy")}
              </Link>
              <Link
                href={`/${lang}/terms`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 13H8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17H8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(lang, "footerTerms")}
              </Link>
              <Link
                href={`/${lang}/medical-disclaimer`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-3 19.5V17a3 3 0 1 1 6 0v4.5A10 10 0 0 0 12 2Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 9v4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 11.5h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(lang, "footerMedical")}
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div>
                © {new Date().getFullYear()} {t(lang, "siteName")} — {t(lang, "footerRights")}
              </div>
              <div className="max-w-xl text-balance text-zinc-500 dark:text-zinc-400">{t(lang, "footerDisclaimerShort")}</div>
            </div>
          </div>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden">
        <div className="relative h-20 w-full overflow-visible">
          {/* Background with blur */}
          <div className="absolute inset-x-0 bottom-0 h-16 border-t border-zinc-200 bg-zinc-50/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95" />
          
          {/* Notch SVG */}
          <div className="absolute left-1/2 top-0 h-12 w-20 -translate-x-1/2 overflow-visible">
            <svg viewBox="0 0 80 48" className="h-full w-full">
              <path
                d="M0 48h80V0c-4 0-8 2-12 8-6 10-14 16-28 16S18 18 12 8C8 2 4 0 0 0v48z"
                className="fill-zinc-50 dark:fill-black"
              />
              <path
                d="M0 0.5c4 0 8 2 12 8 6 10 14 16 28 16s22-6 28-16c4-6 8-8 12-8"
                className="fill-none stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Navigation Items */}
          <div className="relative mx-auto grid h-16 w-full max-w-5xl grid-cols-5 px-2 mt-4">
            <NavLink
              href={`/${lang}/drugs`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
              activeClassName="text-emerald-600 dark:text-emerald-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.5 6.5 6.5 10.5a4 4 0 0 0 5.66 5.66l4-4A4 4 0 1 0 10.5 6.5Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9 15 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t(lang, "drugsNav")}
            </NavLink>

            <NavLink
              href={`/${lang}/companies`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
              activeClassName="text-emerald-600 dark:text-emerald-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t(lang, "companiesTitle")}
            </NavLink>

            <div className="relative flex items-center justify-center">
              <NavLink
                href={`/${lang}`}
                exact
                className="absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform active:scale-95 dark:bg-emerald-500"
                activeClassName="ring-4 ring-white dark:ring-zinc-900"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavLink>
              <span className="mt-8 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                {t(lang, "homeNav")}
              </span>
            </div>

            <NavLink
              href={`/${lang}/active-ingredients`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
              activeClassName="text-emerald-600 dark:text-emerald-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 2v6l-6 10a3 3 0 0 0 2.6 4.5h10.8A3 3 0 0 0 20 18l-6-10V2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t(lang, "activeIngredientsTitle")}
            </NavLink>

            <NavLink
              href={`/${lang}/articles`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
              activeClassName="text-emerald-600 dark:text-emerald-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 12h13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 18h13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h.01" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 12h.01" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t(lang, "articlesNav")}
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="h-16 sm:hidden" />
    </div>
  );
}
