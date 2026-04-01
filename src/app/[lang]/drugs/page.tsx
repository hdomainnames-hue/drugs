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
    description:
      lang === "ar"
        ? "دليل أدوية سريع الفهرسة والتصفح مع صفحات مستقرة مناسبة لمحركات البحث والإعلانات."
        : "Search-friendly drug directory with fast browsing, stable layouts, and ad-ready structure.",
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
  const otherLang = lang === "ar" ? "en" : "ar";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}/drugs${q ? `?q=${encodeURIComponent(q)}` : ""}`, baseUrl).toString() : undefined;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t(lang, "drugsDbTitle"),
    description:
      lang === "ar"
        ? "تصفح قاعدة بيانات الأدوية مع نتائج قابلة للفهرسة وروابط تفصيلية لكل دواء."
        : "Browse an indexable drug database with detailed pages for each medicine.",
    url: pageUrl,
    inLanguage: lang,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: (items as DrugListItem[]).slice(0, 12).map((drug, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: baseUrl ? new URL(`/${lang}/drug/${drug.remoteId}`, baseUrl).toString() : `/${lang}/drug/${drug.remoteId}`,
        name: lang === "ar" ? translations[`Drug:${String(drug.remoteId)}:name`] ?? drug.name : drug.name,
      })),
    },
  };

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

        <div className="flex flex-col gap-6">
          <section className="section-shell rounded-[32px] p-6 sm:p-8">
            <div className="hero-orb hero-orb-a" />
            <div className="hero-orb hero-orb-b" />
            <div className="relative z-10 page-grid">
              <div className="space-y-5">
                <div className="glow-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-white">
                  {lang === "ar" ? "دليل دوائي ثابت وسريع الفهرسة" : "Static-friendly, search-ready catalog"}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                      {q
                        ? lang === "ar"
                          ? `نتائج البحث عن "${q}"`
                          : `Search results for "${q}"`
                        : t(lang, "drugsDbTitle")}
                    </h1>
                    <p className="mt-3 text-sm leading-8 text-zinc-600 dark:text-zinc-300">
                      {lang === "ar"
                        ? "واجهة مصممة للفهرسة السريعة، الربح من الإعلانات، والوصول السهل إلى صفحات الأدوية التفصيلية."
                        : "A browsing experience designed for indexability, ad monetization, and fast access to detailed drug pages."}
                    </p>
                  </div>

                  <Link
                    href={`/${otherLang}/drugs`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 px-4 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 hover:border-blue-400 dark:border-white/10 dark:bg-white/7 dark:text-white dark:hover:border-blue-400"
                  >
                    {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
                  </Link>
                </div>

                <form action={`/${lang}/drugs`} method="get" className="grid grid-cols-1 gap-3 rounded-[26px] bg-white/60 p-3 backdrop-blur md:grid-cols-[1fr_auto] dark:bg-white/6">
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder={t(lang, "searchPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-white/60 bg-white/90 px-4 text-sm text-zinc-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-[#091122] dark:text-white dark:focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    className="h-12 shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 px-6 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
                  >
                    {t(lang, "search")}
                  </button>
                </form>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="premium-card rounded-3xl p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "totalResults")}</div>
                    <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">
                      {total.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                    </div>
                  </div>
                  <div className="premium-card rounded-3xl p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{t(lang, "page")}</div>
                    <div className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">
                      {page}
                    </div>
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {t(lang, "of")} {totalPages}
                    </div>
                  </div>
                  <div className="premium-card rounded-3xl p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      {lang === "ar" ? "نمط الصفحة" : "Page mode"}
                    </div>
                    <div className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? "ثابت + إعادة توليد" : "Static + revalidated"}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="ad-slot rounded-[30px] p-5">
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                      {lang === "ar" ? "مساحة إعلانية محفوظة" : "Reserved ad space"}
                    </div>
                    <div className="mt-3 text-xl font-semibold text-zinc-950 dark:text-white">
                      {lang === "ar" ? "موضع ثابت للإعلانات داخل الدليل" : "Stable in-catalog ad placement"}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                      {lang === "ar"
                        ? "يقلل القفز البصري ويحافظ على تجربة المستخدم أثناء تحقيق الدخل."
                        : "Reduces layout shift while preserving a strong monetized experience."}
                    </div>
                  </div>
                </div>
                <div className="premium-card rounded-[28px] p-5">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    {lang === "ar" ? "منهجية التصفح" : "Browsing strategy"}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                    {lang === "ar"
                      ? "كل بطاقة تقود إلى صفحة دواء مفصلة مع بيانات منظمة وروابط داخلية تعزز السيو."
                      : "Each card links to a detailed drug page with structured data and internal links that support SEO."}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(items as DrugListItem[]).map((d) => {
              const nameKey = `Drug:${String(d.remoteId)}:name`;
              const companyKey = `Drug:${String(d.remoteId)}:company`;
              const activeKey = `Drug:${String(d.remoteId)}:activeIngredient`;
              const name = lang === "ar" ? translations[nameKey] ?? t(lang, "translationPending") : d.name;
              const company = lang === "ar" ? translations[companyKey] ?? "" : d.company || "-";
              const activeIngredient = lang === "ar" ? translations[activeKey] ?? "" : d.activeIngredient || "-";
              const src = d.imageSourceUrl || d.imageLocalPath;
              const thumb = !src
                ? null
                : src.startsWith("http://") || src.startsWith("https://")
                  ? src
                  : src.startsWith("/")
                    ? src
                    : null;

              return (
                <Link
                  key={d.remoteId}
                  href={`/${lang}/drug/${d.remoteId}`}
                  className="premium-card group rounded-[28px] p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="icon-chip shrink-0">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.5 6.5 6.5 10.5a4 4 0 0 0 5.66 5.66l4-4A4 4 0 1 0 10.5 6.5Z" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 9 15 15" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-lg font-semibold text-zinc-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                            {name}
                          </div>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/12 dark:text-blue-300">
                            #{d.remoteId}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="rounded-2xl bg-white/60 px-3 py-3 dark:bg-white/6">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                            <div className="mt-2 min-w-0 wrap-anywhere text-sm font-medium text-zinc-900 dark:text-zinc-100">{company || "-"}</div>
                          </div>
                          <div className="rounded-2xl bg-white/60 px-3 py-3 dark:bg-white/6">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                            <div className="mt-2 min-w-0 wrap-anywhere text-sm font-medium text-zinc-900 dark:text-zinc-100">{activeIngredient || "-"}</div>
                          </div>
                        </div>
                        <div className="mt-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/12 dark:text-violet-300">
                          {t(lang, "price")}: {d.price || "-"}
                        </div>
                      </div>
                    </div>

                    {thumb ? (
                      <img
                        src={thumb}
                        alt={name}
                        loading="lazy"
                        className="h-20 w-20 rounded-[22px] border border-white/50 bg-white/90 object-contain p-2 shadow-[0_14px_26px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0b1326]"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/50 bg-white/80 dark:border-white/10 dark:bg-[#0b1326]">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 3v18" strokeLinecap="round" />
                          <path d="M7 7h7.5a3.5 3.5 0 1 1 0 7H9.5a3.5 3.5 0 1 0 0 7H17" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="section-shell flex flex-col items-center justify-between gap-4 rounded-[28px] px-5 py-4 sm:flex-row">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {t(lang, "page")} {page} {t(lang, "of")} {totalPages}
            </div>
            <div className="flex gap-2">
              {prevPage ? (
                <Link
                  className="rounded-2xl border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/7 dark:text-white"
                  href={buildHref(prevPage)}
                >
                  {t(lang, "prev")}
                </Link>
              ) : (
                <span className="rounded-2xl border border-transparent px-4 py-2 text-sm text-zinc-400">
                  {t(lang, "prev")}
                </span>
              )}

              {nextPage ? (
                <Link
                  className="rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
                  href={buildHref(nextPage)}
                >
                  {t(lang, "next")}
                </Link>
              ) : (
                <span className="rounded-2xl border border-transparent px-4 py-2 text-sm text-zinc-400">
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
