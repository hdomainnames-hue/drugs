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
  const topBadge =
    lang === "ar"
      ? "صفحات سريعة ومهيأة لمحركات البحث وتجربة إعلانية مستقرة"
      : "Fast pages with search-ready structure and stable ad layout";
  const brandTag = lang === "ar" ? "منصة بحث دوائي" : "Drug discovery platform";
  const footerPitch =
    lang === "ar"
      ? "واجهة جديدة تركز على السرعة، السيو، واستيعاب مساحات إعلانية ثابتة بدون إزعاج المستخدم."
      : "A redesigned experience focused on speed, SEO, and stable ad placements without hurting usability.";
  const navItems: Array<{ href: string; label: string; exact?: boolean }> = [
    { href: `/${lang}`, label: t(lang, "homeNav"), exact: true },
    { href: `/${lang}/drugs`, label: t(lang, "drugsNav") },
    { href: `/${lang}/companies`, label: t(lang, "companiesTitle") },
    { href: `/${lang}/active-ingredients`, label: t(lang, "activeIngredientsTitle") },
    { href: `/${lang}/articles`, label: t(lang, "articlesNav") },
    { href: `/${lang}/faq`, label: t(lang, "faqNav") },
  ];
  const footerLinks: Array<{ href: string; label: string }> = [
    { href: `/${lang}/about`, label: t(lang, "footerAbout") },
    { href: `/${lang}/contact`, label: t(lang, "footerContact") },
    { href: `/${lang}/privacy`, label: t(lang, "footerPrivacy") },
    { href: `/${lang}/terms`, label: t(lang, "footerTerms") },
    { href: `/${lang}/medical-disclaimer`, label: t(lang, "footerMedical") },
  ];

  return (
    <div
      dir={dir}
      lang={lang}
      className="app-shell min-h-full flex flex-col text-zinc-950 dark:text-zinc-50"
    >
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="section-shell mb-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_0_6px_rgba(34,211,238,0.14)]" />
              <span>{topBadge}</span>
            </div>
            <div className="glow-pill hidden rounded-full px-3 py-1 text-[11px] font-semibold text-zinc-800 sm:inline-flex dark:text-white">
              {brandTag}
            </div>
          </div>

          <div className="section-shell rounded-[28px] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={`/${lang}`} className="inline-flex items-center gap-3 rounded-full px-1 py-1 text-sm font-semibold tracking-tight">
                <span className="icon-chip">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M10 7a6 6 0 1 1 8 10l-3 3a6 6 0 1 1-8-10l3-3Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 10.5 13.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-base font-semibold text-zinc-950 dark:text-white">{t(lang, "siteName")}</span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{brandTag}</span>
                </span>
              </Link>

              <nav className="hidden flex-1 items-center justify-center gap-2 xl:flex">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    exact={item.exact}
                    className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white/70 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/8 dark:hover:text-white"
                    activeClassName="bg-gradient-to-r from-blue-600 to-violet-500 text-white shadow-[0_12px_30px_rgba(59,130,246,0.24)]"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <div className="hidden lg:block">
                  <NavbarSearch lang={lang} />
                </div>
                <Link
                  href={`/${lang}/contact`}
                  aria-label={t(lang, "footerContact")}
                  title={t(lang, "footerContact")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-zinc-950 transition hover:-translate-y-0.5 hover:border-blue-400 dark:border-white/10 dark:bg-white/6 dark:text-zinc-50 dark:hover:border-blue-400"
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
            </div>

            <div className="mt-3 xl:hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => (
                  <NavLink
                    key={`${item.href}-compact`}
                    href={item.href}
                    exact={item.exact}
                    className="shrink-0 rounded-full border border-white/50 bg-white/60 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-blue-300 hover:text-zinc-950 dark:border-white/10 dark:bg-white/6 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-white"
                    activeClassName="border-transparent bg-gradient-to-r from-blue-600 to-violet-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.22)]"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="px-3 pb-4 pt-10 sm:px-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="section-shell rounded-[32px] px-5 py-8 sm:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  <span className="icon-chip">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M10 7a6 6 0 1 1 8 10l-3 3a6 6 0 1 1-8-10l3-3Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.5 10.5 13.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="text-base">{t(lang, "siteName")}</span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{brandTag}</span>
                  </span>
                </div>
                <div className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">{footerPitch}</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="premium-card rounded-2xl p-4">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">SEO</div>
                    <div className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">{t(lang, "homeSubtitle")}</div>
                  </div>
                  <div className="premium-card rounded-2xl p-4">
                    <div className="text-xs font-semibold text-violet-700 dark:text-violet-300">UX</div>
                    <div className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">
                      {lang === "ar" ? "تنقل واضح وبطاقات ثابتة للموبايل وسرعة تحميل عالية." : "Clear navigation, stable mobile cards, and fast loading."}
                    </div>
                  </div>
                  <div className="premium-card rounded-2xl p-4">
                    <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">AdSense</div>
                    <div className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">
                      {lang === "ar" ? "أماكن مرنة للإعلانات مع تقليل القفز البصري." : "Flexible ad placements with reduced layout shift."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {footerLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="premium-card rounded-2xl px-4 py-3 text-zinc-700 transition hover:-translate-y-0.5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{item.label}</span>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m13 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-6 text-center text-xs text-zinc-500 sm:flex-row dark:text-zinc-400">
              <div>
                © {new Date().getFullYear()} {t(lang, "siteName")} — {t(lang, "footerRights")}
              </div>
              <div className="max-w-2xl text-balance">{t(lang, "footerDisclaimerShort")}</div>
            </div>
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-30 sm:hidden">
        <div className="mx-auto w-full max-w-6xl px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)]">
          <div className="section-shell grid h-[78px] grid-cols-5 items-center rounded-[26px] px-1">
            <NavLink
              href={`/${lang}/drugs`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              activeClassName="text-blue-600 dark:text-blue-300"
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
              activeClassName="text-blue-600 dark:text-blue-300"
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
              activeClassName="text-blue-600 dark:text-blue-300"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-500 text-white shadow-[0_14px_34px_rgba(59,130,246,0.34)] transition-transform active:scale-95">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{t(lang, "homeNav")}</span>
            </NavLink>

            <NavLink
              href={`/${lang}/active-ingredients`}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              activeClassName="text-blue-600 dark:text-blue-300"
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
              activeClassName="text-blue-600 dark:text-blue-300"
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
