import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { deleteFaq } from "./actions";

export default async function AdminFaqPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
    take: 500,
    select: { id: true, lang: true, question: true, order: true, updatedAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">الأسئلة الشائعة</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">إدارة الأسئلة الشائعة لكل لغة.</p>
        </div>
        <Link
          href="/admin/faq/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white hover:bg-(--brand-hover)"
        >
          سؤال جديد
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 px-4 py-3 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="col-span-2">اللغة</div>
          <div className="col-span-1">الترتيب</div>
          <div className="col-span-7">السؤال</div>
          <div className="col-span-2 text-right">إجراءات</div>
        </div>

        {faqs.length ? (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {faqs.map((f) => (
              <div key={String(f.id)} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                <div className="col-span-2">
                  <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-800 dark:bg-black/40">
                    {f.lang}
                  </span>
                </div>
                <div className="col-span-1 text-xs text-zinc-600 dark:text-zinc-400">{f.order}</div>
                <div className="col-span-7 font-medium text-zinc-950 dark:text-zinc-50">{f.question}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/faq/${String(f.id)}`}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    تعديل
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteFaq(String(f.id));
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:border-red-300 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">لا توجد أسئلة بعد.</div>
        )}
      </div>
    </div>
  );
}
