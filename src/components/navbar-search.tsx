"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export default function NavbarSearch({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const submit = () => {
    const query = q.trim();
    if (!query) {
      setOpen(false);
      router.push(`/${lang}/drugs`);
      return;
    }
    setOpen(false);
    router.push(`/${lang}/drugs?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t(lang, "search")}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M10 18a8 8 0 1 1 5.3-14.1A8 8 0 0 1 10 18Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label={t(lang, "close")}
            className="fixed inset-0 z-40 cursor-default bg-black/30 sm:bg-transparent"
            onClick={() => setOpen(false)}
          />

          <div className="sm:hidden">
            <div
              id={panelId}
              className="fixed left-4 right-4 top-16 z-50 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t(lang, "searchPlaceholder")}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {t(lang, "search")}
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {t(lang, "close")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    submit();
                  }}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {t(lang, "drugsNav")}
                </button>
              </div>
            </div>
          </div>

          <div
            className="absolute top-full z-50 mt-2 hidden w-88 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:block"
            style={{ [lang === "ar" ? "right" : "left"]: 0 } as CSSProperties}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t(lang, "searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {t(lang, "search")}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t(lang, "close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  submit();
                }}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t(lang, "drugsNav")}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
