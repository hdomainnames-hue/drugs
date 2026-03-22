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
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

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
    take: 5000,
  });

  const items = rows
    .map((r) => ({ name: (r.activeIngredient ?? "").trim(), count: r._count._all }))
    .filter((r) => r.name);

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "activeIngredientsTitle")}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "activeIngredientsSubtitle")}</p>
          </div>

          {items.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((i) => (
                <Link
                  key={i.name}
                  href={`/${lang}/active-ingredients/${encodeURIComponent(i.name)}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{i.name}</div>
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {t(lang, "totalResults")}: {i.count.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "noActiveIngredients")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
