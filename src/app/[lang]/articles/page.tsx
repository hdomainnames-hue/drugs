import Link from "next/link";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function ArticlesIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const articles = await prisma.article.findMany({
    where: { lang, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { slug: true, title: true, excerpt: true, imageUrl: true, publishedAt: true },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{t(lang, "articlesTitle")}</h1>

        {articles.length ? (
          <div className="mt-6 space-y-3">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/${lang}/articles/${a.slug}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <div className="flex items-start gap-3">
                  {a.imageUrl ? (
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="h-12 w-12 shrink-0 rounded-xl border border-zinc-200 bg-white object-cover dark:border-zinc-800 dark:bg-zinc-950"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{a.title}</div>
                    {a.excerpt ? (
                      <div className="mt-2 text-xs leading-6 text-zinc-600 dark:text-zinc-400">{a.excerpt}</div>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "homeNoArticles")}</div>
        )}
      </div>
    </div>
  );
}
