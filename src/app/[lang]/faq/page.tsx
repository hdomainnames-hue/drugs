import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return {
    title: `${t(lang, "faqTitle")} — ${t(lang, "siteName")}`,
    description: t(lang, "homeFaqsDesc"),
    alternates: {
      canonical: `/${lang}/faq`,
      languages: {
        ar: "/ar/faq",
        en: "/en/faq",
      },
    },
  };
}

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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}/faq`, baseUrl).toString() : undefined;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
    url: pageUrl,
    inLanguage: lang,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      {faqs.length ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
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
