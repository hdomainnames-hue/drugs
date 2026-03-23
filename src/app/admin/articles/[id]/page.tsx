import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { upsertArticle } from "../actions";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bid = (() => {
    try {
      return BigInt(id);
    } catch {
      return null;
    }
  })();

  if (!bid) notFound();

  const article = await prisma.article.findUnique({
    where: { id: bid },
    select: { id: true, lang: true, slug: true, title: true, excerpt: true, imageUrl: true, content: true, publishedAt: true },
  });

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">تعديل مقال</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">تعديل المحتوى وحالة النشر.</p>
        </div>
        <Link
          href="/admin/articles"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          رجوع
        </Link>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await upsertArticle({
            id: String(article.id),
            lang: String(formData.get("lang") || article.lang),
            slug: String(formData.get("slug") || article.slug),
            title: String(formData.get("title") || article.title),
            excerpt: String(formData.get("excerpt") || "") || undefined,
            imageUrl: String(formData.get("imageUrl") || "") || undefined,
            content: String(formData.get("content") || article.content),
            published: Boolean(formData.get("published")),
          });
          redirect("/admin/articles");
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">اللغة</div>
            <select
              name="lang"
              defaultValue={article.lang === "en" ? "en" : "ar"}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            >
              <option value="ar">ar</option>
              <option value="en">en</option>
            </select>
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الرابط</div>
            <input
              name="slug"
              defaultValue={article.slug}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              required
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">العنوان</div>
          <input
            name="title"
            defaultValue={article.title}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ملخص (اختياري)</div>
          <textarea
            name="excerpt"
            defaultValue={article.excerpt ?? ""}
            rows={3}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">رابط الصورة (اختياري)</div>
          <input
            name="imageUrl"
            defaultValue={article.imageUrl ?? ""}
            placeholder="https://..."
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">المحتوى</div>
          <textarea
            name="content"
            defaultValue={article.content}
            rows={16}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={Boolean(article.publishedAt)} className="h-4 w-4" />
          منشور
        </label>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
