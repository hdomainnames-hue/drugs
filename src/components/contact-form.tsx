"use client";

import { useState } from "react";

import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export default function ContactForm({ lang }: { lang: Lang }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === "string" ? data.error : t(lang, "contactSendError"));
        return;
      }

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSuccess(t(lang, "contactSendSuccess"));
    } catch {
      setError(t(lang, "contactSendError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t(lang, "contactName")}</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t(lang, "contactEmail")}</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
      </div>

      <label className="space-y-1">
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t(lang, "contactSubject")}</div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      <label className="space-y-1">
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t(lang, "contactMessage")}</div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-(--brand) dark:border-zinc-800 dark:bg-zinc-950 dark:text-(--brand)">{success}</div> : null}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60"
        >
          {loading ? t(lang, "contactSending") : t(lang, "contactSend")}
        </button>
      </div>
    </div>
  );
}
