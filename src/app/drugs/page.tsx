import Link from "next/link";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function toInt(v: string | undefined, fallback: number) {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const dynamic = "force-dynamic";

type DrugListItem = Prisma.DrugGetPayload<{
  select: {
    remoteId: true;
    name: true;
    company: true;
    activeIngredient: true;
    price: true;
  };
}>;

export default async function DrugsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (qRaw ?? "").trim();

  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = toInt(pageRaw, 1);
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { company: { contains: q, mode: "insensitive" as const } },
          { activeIngredient: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.drug.findMany({
      where,
      orderBy: { remoteId: "asc" },
      skip,
      take: pageSize,
      select: {
        remoteId: true,
        name: true,
        company: true,
        activeIngredient: true,
        price: true,
      },
    }),
    prisma.drug.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/drugs?${params.toString()}`;
  };

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">قاعدة بيانات الأدوية</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              إجمالي النتائج: {total.toLocaleString("en-US")}
            </p>
          </div>

          <form action="/drugs" method="get" className="flex flex-col gap-2 sm:flex-row">
            <input
              name="q"
              defaultValue={q}
              placeholder="ابحث باسم الدواء / الشركة / المادة الفعالة"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              بحث
            </button>
          </form>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(items as DrugListItem[]).map((d) => (
              <Link
                key={d.remoteId}
                href={`/drug/${d.remoteId}`}
                className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                    {d.name}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <div>الشركة: {d.company || "-"}</div>
                    <div>المادة الفعالة: {d.activeIngredient || "-"}</div>
                    <div>السعر: {d.price || "-"}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              صفحة {page} من {totalPages}
            </div>
            <div className="flex gap-2">
              {prevPage ? (
                <Link
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  href={buildHref(prevPage)}
                >
                  السابق
                </Link>
              ) : (
                <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-zinc-400">
                  السابق
                </span>
              )}

              {nextPage ? (
                <Link
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  href={buildHref(nextPage)}
                >
                  التالي
                </Link>
              ) : (
                <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-zinc-400">
                  التالي
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
