"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpsertArticleInput = {
  id?: string;
  lang: string;
  slug: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  content: string;
  published: boolean;
};

export async function upsertArticle(input: UpsertArticleInput) {
  const lang = input.lang === "en" ? "en" : "ar";
  const slug = input.slug.trim();
  const title = input.title.trim();
  const excerpt = input.excerpt?.trim() || null;
  const imageUrl = input.imageUrl?.trim() || null;
  const content = input.content.trim();
  const publishedAt = input.published ? new Date() : null;

  if (!slug || !title || !content) {
    throw new Error("Missing required fields");
  }

  if (input.id) {
    await prisma.article.update({
      where: { id: BigInt(input.id) },
      data: { lang, slug, title, excerpt, imageUrl, content, publishedAt },
    });
  } else {
    await prisma.article.create({
      data: { lang, slug, title, excerpt, imageUrl, content, publishedAt },
    });
  }

  revalidatePath("/admin/articles");
  revalidatePath(`/ar/articles/${slug}`);
  revalidatePath(`/en/articles/${slug}`);
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id: BigInt(id) } });
  revalidatePath("/admin/articles");
}
