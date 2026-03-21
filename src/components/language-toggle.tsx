"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Props = {
  lang: Lang;
};

export default function LanguageToggle({ lang }: Props) {
  const pathname = usePathname();
  const other: Lang = lang === "ar" ? "en" : "ar";

  const nextHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);

  return (
    <Link
      href={nextHref}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
      aria-label={lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
      title={lang === "ar" ? t(lang, "langToEnglish") : t(lang, "langToArabic")}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
