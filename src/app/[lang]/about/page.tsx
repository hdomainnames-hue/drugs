import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{t(lang, "aboutTitle")}</h1>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{t(lang, "aboutBody")}</div>
      </div>
    </div>
  );
}
