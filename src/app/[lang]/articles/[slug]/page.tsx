import { notFound } from "next/navigation";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { slug: true, lang: true, title: true, excerpt: true, content: true, publishedAt: true },
  });

  if (!article || article.lang !== lang || !article.publishedAt) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <article className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{article.title}</h1>
        {article.excerpt ? (
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{article.excerpt}</p>
        ) : null}
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{article.content}</div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="font-semibold">{t(lang, "medicalDisclaimerTitle")}</div>
          <div className="mt-1">{t(lang, "medicalDisclaimerBody")}</div>
        </div>
      </article>
    </div>
  );
}
