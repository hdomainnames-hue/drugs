import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">الرسائل</h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">رسائل صفحة اتصل بنا وإدارة الردود.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 px-4 py-3 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="col-span-3">الاسم</div>
          <div className="col-span-3">البريد</div>
          <div className="col-span-4">الموضوع</div>
          <div className="col-span-1">الحالة</div>
          <div className="col-span-1 text-right">عرض</div>
        </div>

        {messages.length ? (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {messages.map((m) => (
              <div key={String(m.id)} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                <div className="col-span-3 font-medium text-zinc-950 dark:text-zinc-50">{m.name || "-"}</div>
                <div className="col-span-3 text-xs text-zinc-600 dark:text-zinc-400">{m.email || "-"}</div>
                <div className="col-span-4 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{m.subject || "-"}</div>
                <div className="col-span-1">
                  <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] dark:border-zinc-800 dark:bg-black/40">
                    {m.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Link
                    href={`/admin/messages/${m.id}`}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    فتح
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">لا توجد رسائل بعد.</div>
        )}
      </div>
    </div>
  );
}
