import Link from "next/link";
import { redirect } from "next/navigation";

import { upsertFaq } from "../actions";

export default function NewFaqPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">سؤال جديد</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">إنشاء سؤال وإجابة.</p>
        </div>
        <Link
          href="/admin/faq"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          رجوع
        </Link>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await upsertFaq({
            lang: String(formData.get("lang") || "ar"),
            order: Number(formData.get("order") || 0),
            question: String(formData.get("question") || ""),
            answer: String(formData.get("answer") || ""),
          });
          redirect("/admin/faq");
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">اللغة</div>
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
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الترتيب</div>
            <input
              name="order"
              type="number"
              defaultValue={0}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">السؤال</div>
          <input
            name="question"
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الإجابة</div>
          <textarea
            name="answer"
            rows={8}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover)"
          >
            حفظ
          </button>
        </div>
      </form>
    </div>
  );
}
