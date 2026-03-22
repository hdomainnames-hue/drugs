"use client";

import { useEffect, useId, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ImageLightbox({
  src,
  alt,
  className,
  imgClassName,
  lang,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  lang: Lang;
}) {
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
        className={`relative group ${className ?? ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
      >
        <img src={src} alt={alt} className={imgClassName} loading="lazy" />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-700 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 dark:border-zinc-800 dark:bg-black/60 dark:text-zinc-200"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10.5 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 10.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div id={titleId} className="min-w-0 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {alt}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
              >
                {t(lang, "close")}
              </button>
            </div>
            <div className="bg-white p-3 dark:bg-zinc-950">
              <img src={src} alt={alt} className="max-h-[75vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
