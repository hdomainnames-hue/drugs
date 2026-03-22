import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { markMessageDone, markMessageNew, replyToMessage } from "../actions";

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let msgId: bigint;
  try {
    msgId = BigInt(id);
  } catch {
    return (
      <div className="space-y-4">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">معرّف غير صالح.</div>
        <Link href="/admin/messages" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
          العودة
        </Link>
      </div>
    );
  }

  const message = await prisma.contactMessage.findUnique({
    where: { id: msgId },
  });

  if (!message) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">الرسالة غير موجودة.</div>
        <Link href="/admin/messages" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
          العودة
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">تفاصيل الرسالة</h1>
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">الحالة: {message.status}</div>
        </div>
        <Link
          href="/admin/messages"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          العودة
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الاسم</div>
          <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{message.name || "-"}</div>

          <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">البريد</div>
          <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{message.email || "-"}</div>

          <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">الموضوع</div>
          <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{message.subject || "-"}</div>

          <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">تاريخ الإرسال</div>
          <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">{message.createdAt.toISOString()}</div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الرسالة</div>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-950 dark:text-zinc-50">{message.message}</div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <form action={async () => markMessageNew(id)}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
              >
                تعليم كجديدة
              </button>
            </form>
            <form action={async () => markMessageDone(id)}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                تم التعامل
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">الرد</div>

        {message.reply ? (
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            <div className="text-xs font-medium">تم الرد في: {message.repliedAt ? message.repliedAt.toISOString() : "-"}</div>
            <div className="mt-2 whitespace-pre-wrap leading-7">{message.reply}</div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">لم يتم إرسال رد بعد.</div>
        )}

        <form
          action={async (formData) => {
            await replyToMessage(id, formData);
          }}
          className="mt-4 space-y-3"
        >
          <textarea
            name="reply"
            rows={6}
            defaultValue={message.reply || ""}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              حفظ الرد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
