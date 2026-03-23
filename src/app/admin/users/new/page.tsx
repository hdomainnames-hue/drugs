import Link from "next/link";

import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">مستخدم جديد</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">إضافة مستخدم جديد وتحديد دوره وصلاحياته.</p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          رجوع
        </Link>
      </div>

      <form action={createUser} className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">البريد الإلكتروني</div>
            <input
              name="email"
              type="email"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              required
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الاسم (اختياري)</div>
            <input
              name="name"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الدور</div>
            <select
              name="role"
              defaultValue="viewer"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            >
              <option value="admin">admin</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">كلمة المرور</div>
            <input
              name="password"
              type="password"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              required
            />
            <div className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">الحد الأدنى 8 أحرف.</div>
          </label>
        </div>

        <label className="mt-6 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="disabled" className="h-4 w-4" />
          تعطيل المستخدم
        </label>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            حفظ
          </button>
        </div>
      </form>
    </div>
  );
}
