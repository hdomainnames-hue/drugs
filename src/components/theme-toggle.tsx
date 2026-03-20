"use client";

import { useEffect, useState } from "react";

type Props = {
  lightLabel: string;
  darkLabel: string;
};

export default function ThemeToggle({ lightLabel, darkLabel }: Props) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return stored ? stored === "dark" : Boolean(prefersDark);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      window.localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={isDark ? lightLabel : darkLabel}
      onClick={() => {
        const next = !isDark;
        setIsDark(next);
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2v2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20v2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.93 4.93l1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.66 17.66l1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12h2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12h2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.93 19.07l1.41-1.41" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.66 6.34l1.41-1.41" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
