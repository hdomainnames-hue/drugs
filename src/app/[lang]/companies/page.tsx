import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return {
    title: t(lang, "companiesTitle"),
    alternates: {
      canonical: `/${lang}/companies`,
      languages: {
        ar: "/ar/companies",
        en: "/en/companies",
      },
    },
  };
}

export default async function CompaniesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const companies = await prisma.drug.groupBy({
    by: ["company"],
    where: {
      company: {
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
    take: 5000,
  });

  const items = companies
    .map((c) => ({ name: (c.company ?? "").trim(), count: c._count._all }))
    .filter((c) => c.name);

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "companiesTitle")}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "companiesSubtitle")}</p>
          </div>

          {items.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((c) => (
                <Link
                  key={c.name}
                  href={`/${lang}/companies/${encodeURIComponent(c.name)}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{c.name}</div>
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {t(lang, "totalResults")}: {c.count.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "noCompanies")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
