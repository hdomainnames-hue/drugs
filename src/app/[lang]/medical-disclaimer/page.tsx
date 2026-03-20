import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";

export default async function MedicalDisclaimerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "medicalPageTitle")}</h1>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-7">{t(lang, "medicalPageBody")}</div>
      </div>
    </div>
  );
}
