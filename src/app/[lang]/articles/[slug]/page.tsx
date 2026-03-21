import { notFound } from "next/navigation";
import type { Metadata } from "next";

import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { ImageLightbox } from "@/components/image-lightbox";
import { getOrTranslateFields } from "@/lib/translate/translations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { slug: true, lang: true, title: true, excerpt: true, imageUrl: true, publishedAt: true },
  });

  if (!article || !article.publishedAt) {
    return { title: t(lang, "siteName") };
  }

  if (lang !== "ar" && article.lang !== lang) {
    return { title: t(lang, "siteName") };
  }

  const translated = await getOrTranslateFields(lang, [
    { entityType: "Article" as const, entityId: article.slug, field: "title", sourceText: article.title },
    { entityType: "Article" as const, entityId: article.slug, field: "excerpt", sourceText: article.excerpt || "" },
  ]);

  const titleText = lang === "ar" ? translated[`Article:${article.slug}:title`] ?? t(lang, "translationPending") : article.title;
  const excerptText = lang === "ar" ? translated[`Article:${article.slug}:excerpt`] ?? "" : article.excerpt ?? "";

  return {
    title: `${titleText} — ${t(lang, "siteName")}`,
    description: excerptText || t(lang, "homeSubtitle"),
    openGraph: article.imageUrl
      ? {
          images: [{ url: article.imageUrl }],
        }
      : undefined,
    alternates: {
      canonical: `/${lang}/articles/${article.slug}`,
      languages: {
        ar: `/ar/articles/${article.slug}`,
        en: `/en/articles/${article.slug}`,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { slug: true, lang: true, title: true, excerpt: true, imageUrl: true, content: true, publishedAt: true },
  });

  if (!article || !article.publishedAt) notFound();
  if (lang !== "ar" && article.lang !== lang) notFound();

  const translated = await getOrTranslateFields(lang, [
    { entityType: "Article" as const, entityId: article.slug, field: "title", sourceText: article.title },
    { entityType: "Article" as const, entityId: article.slug, field: "excerpt", sourceText: article.excerpt || "" },
    { entityType: "Article" as const, entityId: article.slug, field: "content", sourceText: article.content },
  ]);

  const titleText = lang === "ar" ? translated[`Article:${article.slug}:title`] ?? t(lang, "translationPending") : article.title;
  const excerptText = lang === "ar" ? translated[`Article:${article.slug}:excerpt`] ?? "" : article.excerpt ?? "";
  const contentText = lang === "ar" ? translated[`Article:${article.slug}:content`] ?? "" : article.content;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}/articles/${article.slug}`, baseUrl).toString() : undefined;
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: titleText,
    description: excerptText || undefined,
    datePublished: article.publishedAt?.toISOString?.() ?? undefined,
    dateModified: article.publishedAt?.toISOString?.() ?? undefined,
    image: article.imageUrl ?? undefined,
    inLanguage: lang,
    url: pageUrl,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <article className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{titleText}</h1>
        {article.imageUrl ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <ImageLightbox
              src={article.imageUrl}
              alt={titleText}
              lang={lang}
              className="block w-full"
              imgClassName="h-auto w-full rounded-2xl object-cover"
            />
          </div>
        ) : null}
        {excerptText ? (
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{excerptText}</p>
        ) : null}
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{contentText}</div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="font-semibold">{t(lang, "medicalDisclaimerTitle")}</div>
          <div className="mt-1">{t(lang, "medicalDisclaimerBody")}</div>
        </div>
      </article>
    </div>
  );
}
