import type { Lang } from "@/lib/i18n";
import { isLang, t } from "@/lib/i18n";
import ContactForm from "@/components/contact-form";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "ar";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{t(lang, "contactTitle")}</h1>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{t(lang, "contactBody")}</div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/40">
          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t(lang, "contactSend")}</div>
          <div className="mt-2 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
            {lang === "ar"
              ? "اكتب رسالتك هنا، وسيتم إرسالها إلى لوحة التحكم لمراجعتها والرد عليها."
              : "Write your message here. It will be sent to the admin dashboard for review and reply."}
          </div>
          <ContactForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
