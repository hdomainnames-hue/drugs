import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { ImageLightbox } from "@/components/image-lightbox";

type SimilarEdge = Prisma.DrugSimilarGetPayload<{
  select: {
    toDrug: {
      select: {
        remoteId: true;
        name: true;
        company: true;
        activeIngredient: true;
      };
    };
  };
}>;

function toInt(v: string) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; remoteId: string }>;
}): Promise<Metadata> {
  const { lang: raw, remoteId } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";
  const rid = toInt(remoteId);
  if (!Number.isFinite(rid) || rid <= 0) {
    return {
      title: t(lang, "siteName"),
    };
  }

  const drug = await prisma.drug.findUnique({
    where: { remoteId: rid },
    select: { name: true, company: true, activeIngredient: true },
  });

  if (!drug) {
    return {
      title: t(lang, "siteName"),
    };
  }

  const title = `${drug.name} — ${t(lang, "siteName")}`;
  const parts = [drug.company, drug.activeIngredient].filter(Boolean);
  const description = parts.length
    ? `${t(lang, "basicInfo")}: ${parts.join(" · ")}`
    : t(lang, "homeSubtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/drug/${rid}`,
      languages: {
        ar: `/ar/drug/${rid}`,
        en: `/en/drug/${rid}`,
      },
    },
  };
}

export default async function DrugDetailPage({
  params,
}: {
  params: Promise<{ lang: string; remoteId: string }>;
}) {
  const { lang: raw, remoteId } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const rid = toInt(remoteId);
  if (!Number.isFinite(rid) || rid <= 0) notFound();

  const drug = await prisma.drug.findUnique({
    where: { remoteId: rid },
    select: {
      id: true,
      remoteId: true,
      name: true,
      price: true,
      company: true,
      activeIngredient: true,
      description: true,
      imageSourceUrl: true,
      imageLocalPath: true,
    },
  });

  if (!drug) notFound();

  const similar = await prisma.drugSimilar.findMany({
    where: { fromDrugId: drug.id },
    take: 24,
    orderBy: { id: "asc" },
    select: {
      toDrug: {
        select: {
          remoteId: true,
          name: true,
          company: true,
          activeIngredient: true,
        },
      },
    },
  });

  const otherLang: Lang = lang === "ar" ? "en" : "ar";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}/drug/${drug.remoteId}`, baseUrl).toString() : undefined;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t(lang, "homeNav"),
        item: baseUrl ? new URL(`/${lang}`, baseUrl).toString() : `/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t(lang, "drugsNav"),
        item: baseUrl ? new URL(`/${lang}/drugs`, baseUrl).toString() : `/${lang}/drugs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: drug.name,
        item: pageUrl ?? `/${lang}/drug/${drug.remoteId}`,
      },
    ],
  };

  const drugJsonLd = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: drug.name,
    identifier: String(drug.remoteId),
    manufacturer: drug.company ? { "@type": "Organization", name: drug.company } : undefined,
    activeIngredient: drug.activeIngredient ?? undefined,
    description: drug.description ?? undefined,
    image: drug.imageSourceUrl || drug.imageLocalPath || undefined,
    url: pageUrl,
    inLanguage: lang,
  };

  const imageUrl = (() => {
    const src = drug.imageSourceUrl || drug.imageLocalPath;
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return src;
    return null;
  })();

  const descriptionSections = (() => {
    if (!drug.description) return [] as { title: string; body: string }[];
    const raw = String(drug.description);

    const lines = raw.split(/\r?\n/);
    const sections: { title: string; bodyLines: string[] }[] = [];
    const defaultTitle: string = String(t(lang, "description"));
    let current = { title: defaultTitle, bodyLines: [] as string[] };

    const normalizeTitle = (s: string) =>
      s
        .trim()
        .replace(/^[-*#\s]+/, "")
        .replace(/[:：]+\s*$/, "")
        .trim();

    const isHeading = (line: string) => {
      const l = line.trim();
      if (!l) return false;
      if (/^#{1,6}\s+/.test(l)) return true;
      if (/^\*\*.+\*\*$/.test(l)) return true;
      if (/^[A-Za-z][A-Za-z\s]{2,32}:$/.test(l)) return true;
      if (/^(Introduction|Info|Information|Indications|Dosage|Warnings|Side Effects|Contraindications):?$/i.test(l)) return true;
      if (/^(مقدمة|معلومات|الاستعمالات|الجرعة|تحذيرات|الآثار الجانبية|موانع الاستعمال)[:：]?$/.test(l)) return true;
      return false;
    };

    for (const line of lines) {
      if (isHeading(line)) {
        const title = normalizeTitle(line.replace(/^#{1,6}\s+/, "").replace(/^\*\*|\*\*$/g, ""));
        if (current.bodyLines.join("\n").trim()) sections.push(current);
        current = { title: title || defaultTitle, bodyLines: [] };
        continue;
      }
      current.bodyLines.push(line);
    }

    if (current.bodyLines.join("\n").trim()) sections.push(current);

    const cleaned = sections
      .map((s) => ({ title: s.title, body: s.bodyLines.join("\n").trim() }))
      .filter((s) => s.body);

    if (cleaned.length <= 1) return [{ title: defaultTitle, body: raw }];
    return cleaned;
  })();

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(drugJsonLd) }}
        />
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/${lang}/drugs`}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              ← {t(lang, "backToSearch")}
            </Link>

            <Link
              href={`/${otherLang}/drug/${drug.remoteId}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              {lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
            </Link>
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "overview")}</div>
                {imageUrl ? (
                  <ImageLightbox
                    src={imageUrl}
                    alt={drug.name}
                    lang={lang}
                    className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left dark:border-zinc-800 dark:bg-zinc-950"
                    imgClassName="h-48 w-full object-contain p-3 sm:h-56"
                  />
                ) : null}
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{drug.name}</h1>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t(lang, "idLabel")}: {drug.remoteId}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "price")}</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{drug.price || "-"}</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                  <div className="mt-1 min-w-0 overflow-hidden text-ellipsis text-sm font-semibold leading-6 text-zinc-950 [overflow-wrap:anywhere] dark:text-zinc-50">
                    {drug.company || "-"}
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                  <div className="mt-1 min-w-0 overflow-hidden text-ellipsis text-sm font-semibold leading-6 text-zinc-950 [overflow-wrap:anywhere] dark:text-zinc-50">
                    {drug.activeIngredient || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="text-sm font-semibold">{t(lang, "medicalDisclaimerTitle")}</div>
                <div className="mt-1 text-xs leading-6">{t(lang, "medicalDisclaimerBody")}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "basicInfo")}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "company")}</div>
                <div className="mt-1 min-w-0 overflow-hidden text-ellipsis font-semibold leading-6 text-zinc-950 [overflow-wrap:anywhere] dark:text-zinc-50">
                  {drug.company || "-"}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "activeIngredient")}</div>
                <div className="mt-1 min-w-0 overflow-hidden text-ellipsis font-semibold leading-6 text-zinc-950 [overflow-wrap:anywhere] dark:text-zinc-50">
                  {drug.activeIngredient || "-"}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "price")}</div>
                <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{drug.price || "-"}</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "idLabel")}</div>
                <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{drug.remoteId}</div>
              </div>
            </div>
          </section>

          {drug.description
            ? descriptionSections.map((s, idx) => (
                <section
                  key={`${idx}-${s.title}`}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{s.title}</h2>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{s.body}</div>
                </section>
              ))
            : null}

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "similarDrugs")}</h2>

            {similar.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(similar as SimilarEdge[]).map((s) => (
                  <Link
                    key={s.toDrug.remoteId}
                    href={`/${lang}/drug/${s.toDrug.remoteId}`}
                    className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                  >
                    <div className="text-sm font-semibold text-zinc-950 group-hover:underline dark:text-zinc-50">
                      {s.toDrug.name}
                    </div>
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <div>
                        {t(lang, "company")}: {s.toDrug.company || "-"}
                      </div>
                      <div>
                        {t(lang, "activeIngredient")}: {s.toDrug.activeIngredient || "-"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "noSimilar")}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
