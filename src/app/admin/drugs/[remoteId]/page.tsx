import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { updateDrug } from "../actions";

function toInt(v: string) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
}

export default async function EditDrugPage({
  params,
}: {
  params: Promise<{ remoteId: string }>;
}) {
  const { remoteId } = await params;
  const rid = toInt(remoteId);
  if (!Number.isFinite(rid) || rid <= 0) notFound();

  const drug = await prisma.drug.findUnique({
    where: { remoteId: rid },
    select: {
      remoteId: true,
      name: true,
      company: true,
      activeIngredient: true,
      price: true,
      description: true,
      metaDescription: true,
    },
  });

  if (!drug) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">تعديل دواء</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">تعديل بيانات الدواء لتحسين السيو والوضوح.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/drugs"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
          >
            رجوع
          </Link>
          <Link
            href={`/ar/drug/${drug.remoteId}`}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
          >
            عرض
          </Link>
        </div>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await updateDrug({
            remoteId: drug.remoteId,
            name: String(formData.get("name") || drug.name),
            company: String(formData.get("company") || "") || undefined,
            activeIngredient: String(formData.get("activeIngredient") || "") || undefined,
            price: String(formData.get("price") || "") || undefined,
            metaDescription: String(formData.get("metaDescription") || "") || undefined,
            description: String(formData.get("description") || "") || undefined,
          });
          redirect("/admin/drugs");
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الاسم</div>
            <input
              name="name"
              defaultValue={drug.name}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              required
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الشركة</div>
            <input
              name="company"
              defaultValue={drug.company ?? ""}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">المادة الفعالة</div>
            <input
              name="activeIngredient"
              defaultValue={drug.activeIngredient ?? ""}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>

          <label className="space-y-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">السعر</div>
            <input
              name="price"
              defaultValue={drug.price ?? ""}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">وصف الميتا (اختياري)</div>
            <input
              name="metaDescription"
              defaultValue={drug.metaDescription ?? ""}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الوصف (اختياري)</div>
          <textarea
            name="description"
            defaultValue={drug.description ?? ""}
            rows={10}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
          />
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
