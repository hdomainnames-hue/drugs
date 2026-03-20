import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

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
      url: true,
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

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
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

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{drug.name}</h1>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <div>
                {t(lang, "price")}: {drug.price || "-"}
              </div>
              <div>
                {t(lang, "company")}: {drug.company || "-"}
              </div>
              <div className="sm:col-span-2">
                {t(lang, "activeIngredient")}: {drug.activeIngredient || "-"}
              </div>
            </div>

            {drug.description ? (
              <div className="mt-5">
                <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "info")}</h2>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                  {drug.description}
                </div>
              </div>
            ) : null}

            {drug.url ? (
              <div className="mt-5 text-sm">
                <a
                  href={drug.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-zinc-700 underline hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  {t(lang, "source")}
                </a>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "similarDrugs")}</h2>

            {similar.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(similar as SimilarEdge[]).map((s) => (
                  <Link
                    key={s.toDrug.remoteId}
                    href={`/${lang}/drug/${s.toDrug.remoteId}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                  >
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{s.toDrug.name}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
