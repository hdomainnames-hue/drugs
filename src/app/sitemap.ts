import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const corePaths = [
    "/ar",
    "/en",
    "/ar/drugs",
    "/en/drugs",
    "/ar/articles",
    "/en/articles",
    "/ar/faq",
    "/en/faq",
    "/ar/about",
    "/en/about",
    "/ar/contact",
    "/en/contact",
    "/ar/privacy",
    "/en/privacy",
    "/ar/terms",
    "/en/terms",
    "/ar/medical-disclaimer",
    "/en/medical-disclaimer",
  ];

  const [drugs, articles] = await (async () => {
    try {
      return await Promise.all([
        prisma.drug.findMany({
          select: { remoteId: true, updatedAt: true },
          orderBy: { remoteId: "asc" },
          take: 50000,
        }),
        prisma.article.findMany({
          where: { publishedAt: { not: null } },
          select: { slug: true, updatedAt: true, publishedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 50000,
        }),
      ]);
    } catch {
      return [[], []] as const;
    }
  })();

  const core = corePaths.map((p) => ({
    url: new URL(p, baseUrl).toString(),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "/ar" || p === "/en" ? 1 : 0.7,
  }));

  const drugUrls = drugs.flatMap((d) => {
    const lastModified = d.updatedAt ?? now;
    return [
      {
        url: new URL(`/ar/drug/${d.remoteId}`, baseUrl).toString(),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      {
        url: new URL(`/en/drug/${d.remoteId}`, baseUrl).toString(),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
    ];
  });

  const articleUrls = articles.flatMap((a) => {
    const lastModified = a.updatedAt ?? a.publishedAt ?? now;
    return [
      {
        url: new URL(`/ar/articles/${a.slug}`, baseUrl).toString(),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
      {
        url: new URL(`/en/articles/${a.slug}`, baseUrl).toString(),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ];
  });

  return [...core, ...drugUrls, ...articleUrls];
}
