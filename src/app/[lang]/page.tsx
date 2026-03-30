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
        <section className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950 sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {t(lang, "homeHeroTitle")}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  {t(lang, "homeHeroBody")}
                </p>
              </div>

              <Link
                href={lang === "ar" ? "/en" : "/ar"}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
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
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>
              <button
                type="submit"
                className="mt-6 h-12 rounded-2xl bg-zinc-950 px-6 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 sm:mt-5"
              >
                {t(lang, "homeSearchCta")}
              </button>
            </form>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "homeStatsTitle")}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {t(lang, "homeTotalDrugs")}: {totalDrugs.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                </div>
              </div>

              <Link
                href={`/${lang}/drugs`}
                className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "drugsDbTitle")}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "homeBrowseAllDrugs")}</div>
              </Link>

              <Link href={`/${lang}/medical-disclaimer`} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 transition hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="text-xs font-medium opacity-90">{t(lang, "medicalDisclaimerTitle")}</div>
                <div className="mt-1 text-sm font-semibold">{t(lang, "footerMedical")}</div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/${lang}/drugs`}
            className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
          >
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "drugsNav")}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "homeBrowseAllDrugs")}</div>
          </Link>
          <Link
            href={`/${lang}/companies`}
            className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
          >
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "companiesTitle")}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "company")}</div>
          </Link>
          <Link
            href={`/${lang}/active-ingredients`}
            className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
          >
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredientsTitle")}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "activeIngredient")}</div>
          </Link>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
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
                    className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
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

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
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
                    className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
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
