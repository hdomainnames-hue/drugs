import Link from "next/link";
import { headers } from "next/headers";

import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function isInternalLangPath(lang: Lang, pathname: string) {
  return pathname === `/${lang}` || pathname.startsWith(`/${lang}/`);
}

export default async function SmartBackLink({ lang }: { lang: Lang }) {
  const h = await headers();
  const ref = h.get("referer");
  if (!ref) return null;

  let url: URL;
  try {
    url = new URL(ref);
  } catch {
    return null;
  }

  const pathname = normalizePathname(url.pathname);
  if (!isInternalLangPath(lang, pathname)) return null;

  const href = `${pathname}${url.search}`;

  let label: string | null = null;
  if (pathname.startsWith(`/${lang}/drugs`)) {
    const q = String(url.searchParams.get("q") || "").trim();
    label = q ? t(lang, "backToSearch") : t(lang, "backToDrugs");
  } else if (pathname.startsWith(`/${lang}/companies`)) {
    label = t(lang, "backToCompanies");
  } else if (pathname.startsWith(`/${lang}/active-ingredients`)) {
    label = t(lang, "backToActiveIngredients");
  } else {
    return null;
  }

  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600 sm:h-9 sm:text-sm"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="max-w-[12rem] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-none">{label}</span>
    </Link>
  );
}
