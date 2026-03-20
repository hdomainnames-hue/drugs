import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SimilarEdge = Prisma.DrugSimilarGetPayload<{
  select: {
    toDrug: {
      select: {
        remoteId: true;
        name: true;
        company: true;
        activeIngredient: true;
      };
    };
  };
}>;

function toInt(v: string) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
}

export default async function DrugDetailPage({
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
      id: true,
      remoteId: true,
      name: true,
      price: true,
      company: true,
      activeIngredient: true,
      description: true,
      metaDescription: true,
      url: true,
    },
  });

  if (!drug) notFound();

  const similar = await prisma.drugSimilar.findMany({
    where: { fromDrugId: drug.id },
    take: 24,
    orderBy: { id: "asc" },
    select: {
      toDrug: {
        select: {
          remoteId: true,
          name: true,
          company: true,
          activeIngredient: true,
        },
      },
    },
  });

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/drugs"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              ← الرجوع إلى البحث
            </Link>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">ID: {drug.remoteId}</div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {drug.name}
            </h1>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <div>السعر: {drug.price || "-"}</div>
              <div>الشركة: {drug.company || "-"}</div>
              <div className="sm:col-span-2">المادة الفعالة: {drug.activeIngredient || "-"}</div>
            </div>

            {drug.description ? (
              <div className="mt-5">
                <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">معلومات</h2>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                  {drug.description}
                </div>
              </div>
            ) : null}

            {drug.url ? (
              <div className="mt-5 text-sm">
                <a
                  href={drug.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-zinc-700 underline hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  المصدر
                </a>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">أدوية مشابهة</h2>

            {similar.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(similar as SimilarEdge[]).map((s) => (
                  <Link
                    key={s.toDrug.remoteId}
                    href={`/drug/${s.toDrug.remoteId}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                  >
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {s.toDrug.name}
                    </div>
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <div>الشركة: {s.toDrug.company || "-"}</div>
                      <div>المادة الفعالة: {s.toDrug.activeIngredient || "-"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">لا توجد أدوية مشابهة مسجلة.</div>
            )}
          </div>

          {drug.metaDescription ? (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Meta description: {drug.metaDescription}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
