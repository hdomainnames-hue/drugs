import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { getOrTranslateFields } from "@/lib/translate/translations";

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

  const primaryLang = lang === "ar" ? "en" : lang;
  const faqs = await prisma.faq.findMany({
    where: { lang: primaryLang },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    take: 200,
    select: { id: true, question: true, answer: true },
  });

  const translations = await getOrTranslateFields(
    lang,
    faqs.flatMap((f) => [
      { entityType: "FAQ" as const, entityId: String(f.id), field: "question", sourceText: f.question },
      { entityType: "FAQ" as const, entityId: String(f.id), field: "answer", sourceText: f.answer },
    ]),
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = baseUrl ? new URL(`/${lang}/faq`, baseUrl).toString() : undefined;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => {
      const qKey = `FAQ:${String(f.id)}:question`;
      const aKey = `FAQ:${String(f.id)}:answer`;
      const question = lang === "ar" ? translations[qKey] ?? t(lang, "translationPending") : f.question;
      const answer = lang === "ar" ? translations[aKey] ?? t(lang, "translationPending") : f.answer;
      return {
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      };
    }),
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
              (() => {
                const qKey = `FAQ:${String(f.id)}:question`;
                const aKey = `FAQ:${String(f.id)}:answer`;
                const question = lang === "ar" ? translations[qKey] ?? t(lang, "translationPending") : f.question;
                const answer = lang === "ar" ? translations[aKey] ?? t(lang, "translationPending") : f.answer;

                return (
              <div
                key={String(f.id)}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{question}</div>
                <div className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-600 dark:text-zinc-400">{answer}</div>
              </div>
                );
              })()
            ))}
          </div>
        ) : (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">{t(lang, "homeNoFaqs")}</div>
        )}
      </div>
    </div>
  );
}
