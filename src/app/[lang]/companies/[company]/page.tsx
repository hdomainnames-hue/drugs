import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { getOrTranslateFields } from "@/lib/translate/translations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; company: string }>;
}): Promise<Metadata> {
  const { lang: raw, company } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const name = decodeURIComponent(company);

  return {
    title: `${name} — ${t(lang, "companiesTitle")}`,
    alternates: {
      canonical: `/${lang}/companies/${encodeURIComponent(name)}`,
      languages: {
        ar: `/ar/companies/${encodeURIComponent(name)}`,
        en: `/en/companies/${encodeURIComponent(name)}`,
      },
    },
  };
}

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; company: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw, company } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const companyName = decodeURIComponent(company);

  const sp = await searchParams;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = (() => {
    const n = Number.parseInt(String(pageRaw ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const [items, total, companyTitleTr] = await Promise.all([
    prisma.drug.findMany({
    where: { company: companyName },
    orderBy: { remoteId: "asc" },
    skip,
    take: pageSize,
    select: { remoteId: true, name: true, company: true, activeIngredient: true, price: true },
    }),
    prisma.drug.count({ where: { company: companyName } }),
    getOrTranslateFields(lang, [
      { entityType: "Drug" as const, entityId: `company:${companyName}`, field: "company", sourceText: companyName },
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

  const companyTitle = lang === "ar" ? companyTitleTr[`Drug:company:${companyName}:company`] ?? t(lang, "translationPending") : companyName;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const buildHref = (p: number) => `/${lang}/companies/${encodeURIComponent(companyName)}?page=${p}`;

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{companyTitle}</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t(lang, "totalResults")}: {total.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
              </p>
            </div>
            <Link
              href={`/${lang}/companies`}
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
              const companyTr = lang === "ar" ? translations[companyKey] ?? "" : d.company || "-";
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
                        {t(lang, "company")}: {companyTr || "-"}
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
