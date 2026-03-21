import { prisma } from "@/lib/prisma";
import { setSetting } from "./actions";

const keys = ["site_email", "site_name_ar", "site_name_en", "default_meta_ar", "default_meta_en"];

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Basic site settings stored in the database.</p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          for (const k of keys) {
            await setSetting(k, String(formData.get(k) || ""));
          }
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {keys.map((k) => (
            <label key={k} className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{k}</div>
              <input
                name={k}
                defaultValue={map.get(k) ?? ""}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
