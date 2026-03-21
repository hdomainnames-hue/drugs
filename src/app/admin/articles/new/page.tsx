import Link from "next/link";
import { redirect } from "next/navigation";

import { upsertArticle } from "../actions";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New article</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Create an Arabic or English article.</p>
        </div>
        <Link
          href="/admin/articles"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          Back
        </Link>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await upsertArticle({
            lang: String(formData.get("lang") || "ar"),
            slug: String(formData.get("slug") || ""),
            title: String(formData.get("title") || ""),
            excerpt: String(formData.get("excerpt") || "") || undefined,
            imageUrl: String(formData.get("imageUrl") || "") || undefined,
            content: String(formData.get("content") || ""),
            published: Boolean(formData.get("published")),
          });
          redirect("/admin/articles");
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Language</div>
            <select
              name="lang"
              defaultValue="ar"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            >
              <option value="ar">ar</option>
              <option value="en">en</option>
            </select>
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Slug</div>
            <input
              name="slug"
              placeholder="example-article"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              required
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Title</div>
          <input
            name="title"
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Excerpt (optional)</div>
          <textarea
            name="excerpt"
            rows={3}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Image URL (optional)</div>
          <input
            name="imageUrl"
            placeholder="https://..."
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Content</div>
          <textarea
            name="content"
            rows={16}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" className="h-4 w-4" />
          Publish now
        </label>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
