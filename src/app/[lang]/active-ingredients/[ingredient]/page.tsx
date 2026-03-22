import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { getOrTranslateFields } from "@/lib/translate/translations";

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
}: {
  params: Promise<{ lang: string; ingredient: string }>;
}) {
  const { lang: raw, ingredient } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const ingredientName = decodeURIComponent(ingredient);

  const items = await prisma.drug.findMany({
    where: { activeIngredient: ingredientName },
    orderBy: { remoteId: "asc" },
    take: 5000,
    select: { remoteId: true, name: true, company: true, activeIngredient: true, price: true },
  });

  const translations = await getOrTranslateFields(
    lang,
    items.flatMap((d) => [
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "name", sourceText: d.name },
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "company", sourceText: d.company || "" },
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "activeIngredient", sourceText: d.activeIngredient || "" },
    ]),
  );

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{ingredientName}</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t(lang, "totalResults")}: {items.length.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
              </p>
            </div>
            <Link
              href={`/${lang}/active-ingredients`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              {t(lang, "backToSearch")}
            </Link>
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
        </div>
      </div>
    </div>
  );
}
