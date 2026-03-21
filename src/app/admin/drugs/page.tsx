import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminDrugsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q || "").trim();
  const page = Math.max(1, Number(sp.page || 1) || 1);
  const take = 50;
  const skip = (page - 1) * take;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { company: { contains: q, mode: "insensitive" as const } },
          { activeIngredient: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.drug.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take,
      select: { remoteId: true, name: true, company: true, activeIngredient: true, updatedAt: true },
    }),
    prisma.drug.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Drugs</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Edit drug fields to improve content quality.</p>
        </div>
        <Link
          href="/ar/drugs"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          View listing
        </Link>
      </div>

      <form className="flex gap-2" action="/admin/drugs" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name/company/active ingredient"
          className="h-11 flex-1 rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 px-4 py-3 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="col-span-2">ID</div>
          <div className="col-span-5">Name</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {items.length ? (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((d) => (
              <div key={d.remoteId} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                <div className="col-span-2 text-xs text-zinc-600 dark:text-zinc-400">{d.remoteId}</div>
                <div className="col-span-5 font-medium text-zinc-950 dark:text-zinc-50">{d.name}</div>
                <div className="col-span-3 text-xs text-zinc-600 dark:text-zinc-400">{d.company || "-"}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/drugs/${d.remoteId}`}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/ar/drug/${d.remoteId}`}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">No drugs found.</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <div>
          Page {page} of {totalPages} — {total} items
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/drugs?q=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}`}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            Prev
          </Link>
          <Link
            href={`/admin/drugs?q=${encodeURIComponent(q)}&page=${Math.min(totalPages, page + 1)}`}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
