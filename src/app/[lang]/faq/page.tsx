import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  const faqs = await prisma.faq.findMany({
    where: { lang },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    take: 200,
    select: { id: true, question: true, answer: true },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{t(lang, "faqTitle")}</h1>

        {faqs.length ? (
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <div
                key={String(f.id)}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{f.question}</div>
                <div className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-600 dark:text-zinc-400">{f.answer}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "homeNoFaqs")}</div>
        )}
      </div>
    </div>
  );
}
