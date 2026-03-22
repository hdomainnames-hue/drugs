import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { getOrTranslateFields } from "@/lib/translate/translations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return {
    title: t(lang, "activeIngredientsTitle"),
    alternates: {
      canonical: `/${lang}/active-ingredients`,
      languages: {
        ar: "/ar/active-ingredients",
        en: "/en/active-ingredients",
      },
    },
  };
}

export default async function ActiveIngredientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const sp = await searchParams;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = (() => {
    const n = Number.parseInt(String(pageRaw ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();
  const pageSize = 60;
  const skip = (page - 1) * pageSize;

  const rows = await prisma.drug.groupBy({
    by: ["activeIngredient"],
    where: {
      activeIngredient: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    skip,
    take: pageSize + 1,
  });

  const hasNext = rows.length > pageSize;
  const pageRows = (hasNext ? rows.slice(0, pageSize) : rows)
    .map((r) => ({ name: (r.activeIngredient ?? "").trim(), count: r._count._all }))
    .filter((r) => r.name);

  const translations = await getOrTranslateFields(
    lang,
    pageRows.map((r) => ({ entityType: "Drug" as const, entityId: `ai:${r.name}`, field: "activeIngredient", sourceText: r.name })),
  );

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasNext ? page + 1 : null;
  const buildHref = (p: number) => `/${lang}/active-ingredients?page=${p}`;

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "activeIngredientsTitle")}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "activeIngredientsSubtitle")}</p>
          </div>

          {pageRows.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pageRows.map((i) => {
                const k = `Drug:ai:${i.name}:activeIngredient`;
                const label = lang === "ar" ? translations[k] ?? t(lang, "translationPending") : i.name;

                return (
                  <Link
                    key={i.name}
                    href={`/${lang}/active-ingredients/${encodeURIComponent(i.name)}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                  >
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{label}</div>
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {t(lang, "totalResults")}: {i.count.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "noActiveIngredients")}</div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t(lang, "page")} {page}
            </div>
            <div className="flex gap-2">
              {prevPage ? (
                <Link
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  href={buildHref(prevPage)}
                >
                  {t(lang, "prev")}
                </Link>
              ) : (
                <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-zinc-400">{t(lang, "prev")}</span>
              )}

              {nextPage ? (
                <Link
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  href={buildHref(nextPage)}
                >
                  {t(lang, "next")}
                </Link>
              ) : (
                <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-zinc-400">{t(lang, "next")}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
