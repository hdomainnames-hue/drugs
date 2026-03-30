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

  return (
    <div className="flex flex-1">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        <section className="glass-card rounded-3xl p-6 shadow-[0_20px_60px_rgba(22,44,88,0.08)] sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 text-xs font-semibold text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  SEO + Mobile First
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                  {t(lang, "homeHeroTitle")}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  {t(lang, "homeHeroBody")}
                </p>
              </div>

              <Link
                href={lang === "ar" ? "/en" : "/ar"}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-medium text-zinc-950 transition hover:border-teal-400 hover:text-teal-700 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50 dark:hover:border-teal-500 dark:hover:text-teal-300"
              >
                {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
              </Link>
            </div>

            <form action={`/${lang}/drugs`} method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "homeSearchLabel")}</div>
                <input
                  name="q"
                  placeholder={t(lang, "searchPlaceholder")}
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 text-sm text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-50 dark:focus:border-teal-400"
                />
              </div>
              <button
                type="submit"
                className="mt-6 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 text-sm font-semibold text-white shadow-md shadow-teal-500/20 transition hover:scale-[1.01] hover:opacity-95 sm:mt-5"
              >
                {t(lang, "homeSearchCta")}
              </button>
            </form>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="soft-card rounded-2xl p-4">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "homeStatsTitle")}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {t(lang, "homeTotalDrugs")}: {totalDrugs.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                </div>
              </div>

              <Link
                href={`/${lang}/drugs`}
                className="glass-card rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-teal-400 dark:hover:border-teal-500"
              >
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "drugsDbTitle")}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "homeBrowseAllDrugs")}</div>
              </Link>

              <Link href={`/${lang}/medical-disclaimer`} className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 transition hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="text-xs font-medium opacity-90">{t(lang, "medicalDisclaimerTitle")}</div>
                <div className="mt-1 text-sm font-semibold">{t(lang, "footerMedical")}</div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/${lang}/drugs`}
            className="glass-card rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-teal-400 dark:hover:border-teal-500"
          >
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "drugsNav")}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "homeBrowseAllDrugs")}</div>
          </Link>
          <Link
            href={`/${lang}/companies`}
            className="glass-card rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-blue-400 dark:hover:border-blue-500"
          >
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "companiesTitle")}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "company")}</div>
          </Link>
          <Link
            href={`/${lang}/active-ingredients`}
            className="glass-card rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-violet-400 dark:hover:border-violet-500"
          >
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredientsTitle")}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "activeIngredient")}</div>
          </Link>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "homeLatestArticles")}</h2>
              <Link
                href={`/${lang}/articles`}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {t(lang, "viewAll")}
              </Link>
            </div>

            {latestArticles.length ? (
              <div className="mt-4 space-y-3">
                {latestArticles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/${lang}/articles/${a.slug}`}
                    className="block rounded-2xl border border-zinc-200/90 bg-white/90 p-4 transition hover:border-teal-400 dark:border-zinc-800/90 dark:bg-zinc-950/90 dark:hover:border-teal-500"
                  >
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {lang === "ar" ? translations[`Article:${a.slug}:title`] ?? t(lang, "translationPending") : a.title}
                    </div>
                    <div className="mt-2 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
                      {lang === "ar" ? translations[`Article:${a.slug}:excerpt`] ?? "" : a.excerpt || ""}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "homeNoArticles")}</div>
            )}
          </section>

          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "homeLatestFaqs")}</h2>
              <Link
                href={`/${lang}/faq`}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {t(lang, "viewAll")}
              </Link>
            </div>

            {latestFaqs.length ? (
              <div className="mt-4 space-y-3">
                {latestFaqs.map((f) => (
                  <div
                    key={String(f.id)}
                    className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 dark:border-zinc-800/90 dark:bg-zinc-950/90"
                  >
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {lang === "ar" ? translations[`FAQ:${String(f.id)}:question`] ?? t(lang, "translationPending") : f.question}
                    </div>
                    <div className="mt-2 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
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
