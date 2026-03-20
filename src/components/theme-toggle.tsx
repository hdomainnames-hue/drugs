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
      onClick={() => {
        const next = !isDark;
        setIsDark(next);
      }}
      className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600"
    >
      {isDark ? lightLabel : darkLabel}
    </button>
  );
}
