import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { getOrTranslateFields } from "@/lib/translate/translations";
import SmartBackLink from "@/components/smart-back-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; ingredient: string }>;
}): Promise<Metadata> {
  const { lang: raw, ingredient } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const name = decodeURIComponent(ingredient);

  return {
    title: `${name} — ${t(lang, "activeIngredientsTitle")}`,
    alternates: {
      canonical: `/${lang}/active-ingredients/${encodeURIComponent(name)}`,
      languages: {
        ar: `/ar/active-ingredients/${encodeURIComponent(name)}`,
        en: `/en/active-ingredients/${encodeURIComponent(name)}`,
      },
    },
  };
}

export default async function ActiveIngredientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; ingredient: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw, ingredient } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const ingredientName = decodeURIComponent(ingredient);

  const sp = await searchParams;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = (() => {
    const n = Number.parseInt(String(pageRaw ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const [items, total, ingredientTitleTr] = await Promise.all([
    prisma.drug.findMany({
    where: { activeIngredient: ingredientName },
    orderBy: { remoteId: "asc" },
    skip,
    take: pageSize,
    select: { remoteId: true, name: true, company: true, activeIngredient: true, price: true },
    }),
    prisma.drug.count({ where: { activeIngredient: ingredientName } }),
    getOrTranslateFields(lang, [
      { entityType: "Drug" as const, entityId: `ai:${ingredientName}`, field: "activeIngredient", sourceText: ingredientName },
    ]),
  ]);

  const translations = await getOrTranslateFields(
    lang,
    items.flatMap((d) => [
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "name", sourceText: d.name },
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "company", sourceText: d.company || "" },
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "activeIngredient", sourceText: d.activeIngredient || "" },
    ]),
  );

  const ingredientTitle =
    lang === "ar" ? ingredientTitleTr[`Drug:ai:${ingredientName}:activeIngredient`] ?? t(lang, "translationPending") : ingredientName;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const buildHref = (p: number) => `/${lang}/active-ingredients/${encodeURIComponent(ingredientName)}?page=${p}`;

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{ingredientTitle}</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t(lang, "totalResults")}: {total.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
              </p>
            </div>
            <SmartBackLink lang={lang} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((d) => {
              const nameKey = `Drug:${String(d.remoteId)}:name`;
              const companyKey = `Drug:${String(d.remoteId)}:company`;
              const activeKey = `Drug:${String(d.remoteId)}:activeIngredient`;

              const name = lang === "ar" ? translations[nameKey] ?? t(lang, "translationPending") : d.name;
              const company = lang === "ar" ? translations[companyKey] ?? "" : d.company || "-";
              const activeIngredient = lang === "ar" ? translations[activeKey] ?? "" : d.activeIngredient || "-";

              return (
                <Link
                  key={d.remoteId}
                  href={`/${lang}/drug/${d.remoteId}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="min-w-0 overflow-hidden text-ellipsis wrap-anywhere">
                        {t(lang, "company")}: {company || "-"}
                      </div>
                      <div className="min-w-0 overflow-hidden text-ellipsis wrap-anywhere">
                        {t(lang, "activeIngredient")}: {activeIngredient || "-"}
                      </div>
                      <div>
                        {t(lang, "price")}: {d.price || "-"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t(lang, "page")} {page} {t(lang, "of")} {totalPages}
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
