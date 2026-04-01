import Link from "next/link";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getOrTranslateFields } from "@/lib/translate/translations";

export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const primaryLang = lang === "ar" ? "en" : lang;

  const [totalDrugs, latestArticles, latestFaqs] = await Promise.all([
    prisma.drug.count(),
    prisma.article.findMany({
      where: { lang: primaryLang, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
    }),
    prisma.faq.findMany({
      where: { lang: primaryLang },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      take: 6,
      select: { id: true, question: true, answer: true },
    }),
  ]);

  const translations = await getOrTranslateFields(
    lang,
    [
      ...latestArticles.flatMap((a) => [
        { entityType: "Article" as const, entityId: a.slug, field: "title", sourceText: a.title },
        { entityType: "Article" as const, entityId: a.slug, field: "excerpt", sourceText: a.excerpt || "" },
      ]),
      ...latestFaqs.flatMap((f) => [
        { entityType: "FAQ" as const, entityId: String(f.id), field: "question", sourceText: f.question },
        { entityType: "FAQ" as const, entityId: String(f.id), field: "answer", sourceText: f.answer },
      ]),
    ],
  );

  const otherLang = lang === "ar" ? "en" : "ar";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}`, baseUrl).toString() : undefined;
  const heroBadge = lang === "ar" ? "واجهة فاخرة + صفحات ثابتة ذكية" : "Premium interface + smart static pages";
  const heroEyebrow =
    lang === "ar"
      ? "بحث دوائي مهيأ للسيو، محسن للأرباح، ويحافظ على ثبات المساحات الإعلانية."
      : "SEO-friendly drug discovery with monetization-ready layout stability.";
  const showcaseItems = [
    {
      title: lang === "ar" ? "فهرسة أسرع" : "Faster indexing",
      body:
        lang === "ar"
          ? "صفحات مبنية بإعادة توليد ذكية لتقوية الظهور في محركات البحث."
          : "Pages use smart regeneration to improve search visibility.",
    },
    {
      title: lang === "ar" ? "تجربة موبايل قوية" : "Better mobile UX",
      body:
        lang === "ar"
          ? "تنقل واضح، بطاقات ثابتة، وواجهة خفيفة تحافظ على سرعة التصفح."
          : "Clear navigation, stable cards, and lightweight rendering for mobile.",
    },
    {
      title: lang === "ar" ? "جاهز للإعلانات" : "Ad-ready structure",
      body:
        lang === "ar"
          ? "أماكن إعلانية محفوظة المساحة لتقليل القفز البصري ودعم AdSense."
          : "Reserved ad zones reduce layout shift and support AdSense placement.",
    },
  ] as const;
  const quickLinks = [
    {
      href: `/${lang}/drugs`,
      title: t(lang, "drugsNav"),
      body: t(lang, "homeBrowseAllDrugs"),
      accent: "from-blue-600 to-cyan-500",
    },
    {
      href: `/${lang}/companies`,
      title: t(lang, "companiesTitle"),
      body: lang === "ar" ? "اكتشف الشركات المنتجة وروابطها الدوائية." : "Explore manufacturers and their drug portfolios.",
      accent: "from-violet-600 to-fuchsia-500",
    },
    {
      href: `/${lang}/active-ingredients`,
      title: t(lang, "activeIngredientsTitle"),
      body: lang === "ar" ? "تصفح البدائل عبر المادة الفعالة." : "Browse alternatives by active ingredient.",
      accent: "from-cyan-500 to-sky-500",
    },
  ] as const;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t(lang, "siteName"),
    url: pageUrl,
    inLanguage: lang,
    potentialAction: pageUrl
      ? {
          "@type": "SearchAction",
          target: `${pageUrl.replace(/\/$/, "")}/drugs?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        }
      : undefined,
  };
  const faqJsonLd =
    latestFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: latestFaqs.slice(0, 4).map((faq) => ({
            "@type": "Question",
            name: lang === "ar" ? translations[`FAQ:${String(faq.id)}:question`] ?? faq.question : faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: lang === "ar" ? translations[`FAQ:${String(faq.id)}:answer`] ?? faq.answer : faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="flex flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

        <section className="section-shell rounded-[34px] px-6 py-7 sm:px-8 sm:py-10">
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="page-grid relative z-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-3xl">
                  <div className="glow-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    {heroBadge}
                  </div>
                  <div className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">{heroEyebrow}</div>
                  <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
                    {t(lang, "homeHeroTitle")}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-zinc-600 dark:text-zinc-300">
                    {t(lang, "homeHeroBody")}
                  </p>
                </div>

                <Link
                  href={`/${otherLang}`}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 px-4 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 hover:border-blue-400 dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:border-blue-400"
                >
                  {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
                </Link>
              </div>

              <form action={`/${lang}/drugs`} method="get" className="grid grid-cols-1 gap-3 rounded-[28px] bg-white/60 p-3 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur md:grid-cols-[1fr_auto] dark:bg-white/6">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">{t(lang, "homeSearchLabel")}</div>
                  <input
                    name="q"
                    placeholder={t(lang, "searchPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-white/60 bg-white/90 px-4 text-sm text-zinc-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-[#091122] dark:text-white dark:focus:border-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 px-7 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
                >
                  {t(lang, "homeSearchCta")}
                </button>
              </form>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="premium-card rounded-3xl p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "homeStatsTitle")}</div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">
                    {totalDrugs.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t(lang, "homeTotalDrugs")}</div>
                </div>
                {showcaseItems.map((item) => (
                  <div key={item.title} className="premium-card rounded-3xl p-5">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">{item.title}</div>
                    <div className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{item.body}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="ad-slot rounded-[30px] p-5">
                <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                      {lang === "ar" ? "مساحة إعلانية ثابتة" : "Stable ad placement"}
                    </div>
                    <div className="mt-3 text-xl font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? "تصميم جاهز لإعلانات AdSense بدون إرباك للمستخدم" : "AdSense-ready placement without disrupting the user"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/7 dark:text-zinc-300">
                    {lang === "ar" ? "ارتفاع ثابت، هوامش مريحة، وموضع واضح داخل الصفحة." : "Fixed height, safe spacing, and a clear visual position."}
                  </div>
                </div>
              </div>

              <Link href={`/${lang}/medical-disclaimer`} className="premium-card block rounded-[28px] p-5 text-amber-950 dark:text-amber-100">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{t(lang, "medicalDisclaimerTitle")}</div>
                <div className="mt-3 text-lg font-semibold">{t(lang, "footerMedical")}</div>
                <div className="mt-2 text-sm leading-7 text-amber-900/80 dark:text-amber-100/80">{t(lang, "medicalDisclaimerBody")}</div>
              </Link>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="premium-card group rounded-[28px] p-5 transition hover:-translate-y-1">
              <div className={`inline-flex rounded-full bg-gradient-to-r ${item.accent} px-3 py-1 text-xs font-semibold text-white`}>
                {item.title}
              </div>
              <div className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">{item.body}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600 group-hover:text-zinc-950 dark:text-zinc-300 dark:group-hover:text-white">
                <span>{t(lang, "viewAll")}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m13 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <section className="section-shell rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{t(lang, "homeLatestArticles")}</h2>
              <Link
                href={`/${lang}/articles`}
                className="rounded-full border border-white/50 bg-white/60 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:text-zinc-950 dark:border-white/10 dark:bg-white/6 dark:text-zinc-300 dark:hover:text-white"
              >
                {t(lang, "viewAll")}
              </Link>
            </div>

            {latestArticles.length ? (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {latestArticles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/${lang}/articles/${a.slug}`}
                    className="premium-card rounded-[24px] p-5 transition hover:-translate-y-0.5"
                  >
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? translations[`Article:${a.slug}:title`] ?? t(lang, "translationPending") : a.title}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                      {lang === "ar" ? translations[`Article:${a.slug}:excerpt`] ?? "" : a.excerpt || ""}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "homeNoArticles")}</div>
            )}
          </section>

          <section className="section-shell rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{t(lang, "homeLatestFaqs")}</h2>
              <Link
                href={`/${lang}/faq`}
                className="rounded-full border border-white/50 bg-white/60 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:text-zinc-950 dark:border-white/10 dark:bg-white/6 dark:text-zinc-300 dark:hover:text-white"
              >
                {t(lang, "viewAll")}
              </Link>
            </div>

            {latestFaqs.length ? (
              <div className="mt-5 space-y-3">
                {latestFaqs.slice(0, 4).map((f) => (
                  <div key={String(f.id)} className="premium-card rounded-[24px] p-5">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? translations[`FAQ:${String(f.id)}:question`] ?? t(lang, "translationPending") : f.question}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                      {lang === "ar" ? translations[`FAQ:${String(f.id)}:answer`] ?? t(lang, "translationPending") : f.answer}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "homeNoFaqs")}</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
