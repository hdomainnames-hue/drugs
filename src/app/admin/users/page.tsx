import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 500,
    select: { id: true, email: true, name: true, role: true, disabled: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">المستخدمون</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">إضافة وتعديل وحذف المستخدمين وتحديد الصلاحيات.</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white hover:bg-(--brand-hover)"
        >
          مستخدم جديد
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 px-4 py-3 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="col-span-4">البريد</div>
          <div className="col-span-3">الاسم</div>
          <div className="col-span-2">الدور</div>
          <div className="col-span-1">الحالة</div>
          <div className="col-span-2 text-right">إجراءات</div>
        </div>

        {users.length ? (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((u) => (
              <div key={u.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                <div className="col-span-4 font-medium text-zinc-950 dark:text-zinc-50">{u.email}</div>
                <div className="col-span-3 text-xs text-zinc-600 dark:text-zinc-400">{u.name || "-"}</div>
                <div className="col-span-2">
                  <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-800 dark:bg-black/40">
                    {u.role}
                  </span>
                </div>
                <div className="col-span-1 text-xs">
                  {u.disabled ? (
                    <span className="rounded-lg bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950/30 dark:text-red-200">معطّل</span>
                  ) : (
                    <span className="rounded-lg bg-zinc-50 px-2 py-1 text-(--brand) dark:bg-zinc-950/30 dark:text-(--brand)">نشط</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    تعديل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">لا يوجد مستخدمون بعد.</div>
        )}
      </div>
    </div>
  );
}
