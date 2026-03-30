import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { getOrTranslateFields } from "@/lib/translate/translations";

export const revalidate = 3600;

function toInt(v: string | undefined, fallback: number) {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type DrugListItem = Prisma.DrugGetPayload<{
  select: {
    remoteId: true;
    name: true;
    company: true;
    activeIngredient: true;
    price: true;
    imageSourceUrl: true;
    imageLocalPath: true;
  };
}>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const sp = await searchParams;
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (qRaw ?? "").trim();

  const base: Metadata = {
    title: t(lang, "drugsDbTitle"),
    alternates: {
      canonical: `/${lang}/drugs${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      languages: {
        ar: "/ar/drugs",
        en: "/en/drugs",
      },
    },
  };

  if (!q) return base;

  return {
    ...base,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function DrugsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const sp = await searchParams;
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (qRaw ?? "").trim();

  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = toInt(pageRaw, 1);
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { company: { contains: q, mode: "insensitive" as const } },
          { activeIngredient: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.drug.findMany({
      where,
      orderBy: { remoteId: "asc" },
      skip,
      take: pageSize,
      select: {
        remoteId: true,
        name: true,
        company: true,
        activeIngredient: true,
        price: true,
        imageSourceUrl: true,
        imageLocalPath: true,
      },
    }),
    prisma.drug.count({ where }),
  ]);

  const translations = await getOrTranslateFields(
    lang,
    (items as DrugListItem[]).flatMap((d) => [
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "name", sourceText: d.name },
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "company", sourceText: d.company || "" },
      { entityType: "Drug" as const, entityId: String(d.remoteId), field: "activeIngredient", sourceText: d.activeIngredient || "" },
    ]),
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const buildHref = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    qs.set("page", String(p));
    return `/${lang}/drugs?${qs.toString()}`;
  };

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "drugsDbTitle")}</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t(lang, "totalResults")}: {total.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
              </p>
            </div>

            <Link
              href={lang === "ar" ? "/en/drugs" : "/ar/drugs"}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/85 px-3 text-xs font-medium text-zinc-950 transition hover:border-teal-400 hover:text-teal-700 dark:border-zinc-800 dark:bg-zinc-950/85 dark:text-zinc-50 dark:hover:border-teal-500 dark:hover:text-teal-300"
            >
              {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
            </Link>
          </div>

          <form action={`/${lang}/drugs`} method="get" className="flex flex-col gap-2 sm:flex-row">
            <input
              name="q"
              defaultValue={q}
              placeholder={t(lang, "searchPlaceholder")}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white/90 px-4 text-sm text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-50 dark:focus:border-teal-400"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-5 text-sm font-semibold text-white shadow-sm shadow-teal-500/20 transition hover:scale-[1.01]"
            >
              {t(lang, "search")}
            </button>
          </form>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(items as DrugListItem[]).map((d) => (
              (() => {
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
                className="glass-card rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-teal-400 dark:hover:border-teal-500"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{name}</div>
                    <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
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

                  {(() => {
                    const src = d.imageSourceUrl || d.imageLocalPath;
                    const thumb = !src
                      ? null
                      : src.startsWith("http://") || src.startsWith("https://")
                        ? src
                        : src.startsWith("/")
                          ? src
                          : null;

                    return thumb ? (
                      <img
                        src={thumb}
                        alt={name}
                        loading="lazy"
                        className="h-12 w-12 flex-none rounded-xl border border-zinc-200/90 bg-gradient-to-br from-white to-zinc-50 object-contain p-1 shadow-sm dark:border-zinc-800/90 dark:from-zinc-950 dark:to-zinc-900"
                      />
                    ) : (
                      <div className="h-12 w-12 flex-none rounded-xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:border-zinc-800/90 dark:from-zinc-900 dark:to-zinc-950" />
                    );
                  })()}
                </div>
              </Link>
                );
              })()
            ))}
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
                <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-zinc-400">
                  {t(lang, "prev")}
                </span>
              )}

              {nextPage ? (
                <Link
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  href={buildHref(nextPage)}
                >
                  {t(lang, "next")}
                </Link>
              ) : (
                <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-zinc-400">
                  {t(lang, "next")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
