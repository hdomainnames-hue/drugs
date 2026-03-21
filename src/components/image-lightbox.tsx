"use client";

import { useEffect, useId, useState } from "react";

export function ImageLightbox({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
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
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
      >
        <img src={src} alt={alt} className={imgClassName} loading="lazy" />
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
                Close
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
