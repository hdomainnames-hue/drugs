import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { deleteUser, updateUser } from "../actions";

function toInt(v: string) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const uid = toInt(id);
  if (!Number.isFinite(uid) || uid <= 0) notFound();

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, name: true, role: true, disabled: true },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">تعديل مستخدم</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">تعديل البيانات والدور وتغيير كلمة المرور (اختياري).</p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          رجوع
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await deleteUser(String(user.id));
        }}
      >
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 hover:border-red-300 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
        >
          حذف المستخدم
        </button>
      </form>

      <form
        action={async (formData) => {
          "use server";
          await updateUser(String(user.id), formData);
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">البريد الإلكتروني</div>
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              required
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الاسم (اختياري)</div>
            <input
              name="name"
              defaultValue={user.name ?? ""}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الدور</div>
            <select
              name="role"
              defaultValue={String(user.role)}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            >
              <option value="admin">admin</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">كلمة مرور جديدة (اختياري)</div>
            <input
              name="password"
              type="password"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
            <div className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">إذا تركتها فارغة لن يتم تغيير كلمة المرور. الحد الأدنى 8 أحرف.</div>
          </label>
        </div>

        <label className="mt-6 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="disabled" defaultChecked={Boolean(user.disabled)} className="h-4 w-4" />
          تعطيل المستخدم
        </label>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover)"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
