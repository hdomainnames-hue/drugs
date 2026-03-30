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
      className="app-shell min-h-full flex flex-col text-zinc-950 dark:text-zinc-50"
    >
      <header className="sticky top-0 z-20 border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-semibold tracking-tight">
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
                <nav className="hidden items-center gap-2 rounded-full border border-zinc-200/80 bg-white/75 px-2 py-1 text-sm shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/70 sm:flex">
                  <NavLink
                    href={`/${lang}`}
                    exact
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "homeNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/drugs`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "drugsNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/companies`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "companiesTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/active-ingredients`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "activeIngredientsTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/articles`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "articlesNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/faq`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/80 text-zinc-950 transition hover:scale-105 hover:border-teal-400 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50 dark:hover:border-teal-500"
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
                <nav className="hidden items-center gap-2 rounded-full border border-zinc-200/80 bg-white/75 px-2 py-1 text-sm shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/70 sm:flex">
                  <NavLink
                    href={`/${lang}`}
                    exact
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "homeNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/drugs`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "drugsNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/companies`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "companiesTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/active-ingredients`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "activeIngredientsTitle")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/articles`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
                  >
                    {t(lang, "articlesNav")}
                  </NavLink>
                  <NavLink
                    href={`/${lang}/faq`}
                    className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    activeClassName="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm"
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/80 text-zinc-950 transition hover:scale-105 hover:border-teal-400 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50 dark:hover:border-teal-500"
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

      <footer className="border-t border-zinc-200/70 bg-white/60 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/60">
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

      <nav className="fixed inset-x-0 bottom-0 z-30 sm:hidden">
        <div className="mx-auto w-full max-w-5xl px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)]">
          <div className="grid h-[72px] grid-cols-5 items-center rounded-2xl border border-zinc-200/80 bg-white/85 px-1 shadow-[0_-10px_34px_rgba(20,40,80,0.14)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-[0_-12px_34px_rgba(0,0,0,0.5)]">
            <NavLink
              href={`/${lang}/drugs`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              activeClassName="text-teal-600 dark:text-teal-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.5 6.5 6.5 10.5a4 4 0 0 0 5.66 5.66l4-4A4 4 0 1 0 10.5 6.5Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9 15 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t(lang, "drugsNav")}</span>
            </NavLink>

            <NavLink
              href={`/${lang}/companies`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              activeClassName="text-teal-600 dark:text-teal-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t(lang, "companiesTitle")}</span>
            </NavLink>

            <NavLink
              href={`/${lang}`}
              exact
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400"
              activeClassName="text-teal-600 dark:text-teal-400"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg shadow-teal-500/25 transition-transform active:scale-95">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{t(lang, "homeNav")}</span>
            </NavLink>

            <NavLink
              href={`/${lang}/active-ingredients`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              activeClassName="text-teal-600 dark:text-teal-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 2v6l-6 10a3 3 0 0 0 2.6 4.5h10.8A3 3 0 0 0 20 18l-6-10V2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t(lang, "activeIngredientsTitle")}</span>
            </NavLink>

            <NavLink
              href={`/${lang}/articles`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              activeClassName="text-teal-600 dark:text-teal-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 12h13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 18h13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h.01" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 12h.01" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t(lang, "articlesNav")}</span>
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="h-20 sm:hidden" />
    </div>
  );
}
