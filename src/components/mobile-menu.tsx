"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";

export default function MobileMenu({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600 sm:hidden"
        aria-label={t(lang, "menu")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 6h16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12h16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] bg-black/60 sm:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={() => setOpen(false)}
          >
            <div
              className="absolute top-0 h-full w-[85%] max-w-sm border-r border-zinc-200 bg-zinc-50 p-4 shadow-2xl dark:border-zinc-800 dark:bg-black"
              style={{ [lang === "ar" ? "right" : "left"]: 0 } as CSSProperties}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <div id={titleId} className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {t(lang, "siteName")}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
                >
                  {t(lang, "close")}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <LanguageToggle lang={lang} />
                <ThemeToggle lightLabel={t(lang, "themeLight")} darkLabel={t(lang, "themeDark")} />
              </div>

              <div className="mt-5 space-y-2">
                <Link
                  href={`/${lang}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {t(lang, "homeNav")}
                </Link>
                <Link
                  href={`/${lang}/drugs`}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {t(lang, "drugsNav")}
                </Link>
                <Link
                  href={`/${lang}/articles`}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {t(lang, "articlesNav")}
                </Link>
                <Link
                  href={`/${lang}/faq`}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {t(lang, "faqNav")}
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
