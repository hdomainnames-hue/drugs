import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { upsertFaq } from "../actions";

export default async function EditFaqPage({
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

  const faq = await prisma.faq.findUnique({
    where: { id: bid },
    select: { id: true, lang: true, question: true, answer: true, order: true },
  });

  if (!faq) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">تعديل سؤال</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">تعديل السؤال والإجابة.</p>
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
            id: String(faq.id),
            lang: String(formData.get("lang") || faq.lang),
            order: Number(formData.get("order") || faq.order),
            question: String(formData.get("question") || faq.question),
            answer: String(formData.get("answer") || faq.answer),
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
              defaultValue={faq.lang === "en" ? "en" : "ar"}
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
              defaultValue={faq.order}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">السؤال</div>
          <input
            name="question"
            defaultValue={faq.question}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
        </label>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الإجابة</div>
          <textarea
            name="answer"
            defaultValue={faq.answer}
            rows={8}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
            required
          />
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
