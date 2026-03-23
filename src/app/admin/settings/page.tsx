import { prisma } from "@/lib/prisma";
import { setSetting } from "./actions";

const keys = [
  "site_email",
  "site_name_ar",
  "site_name_en",
  "default_meta_ar",
  "default_meta_en",
  "translate_active_provider",
  "translate_active_gemini_key_index",
  "translate_gemini_model",
  "translate_groq_model",
  "translate_gemini_api_keys",
  "translate_groq_api_keys",
];

const themeKeys = [
  "theme_brand",
  "theme_brand_hover",
  "theme_brand_dark",
  "theme_brand_dark_hover",
];

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: [...keys, ...themeKeys] } },
    select: { key: true, value: true },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));
  const emergencySecret = process.env.ADMIN_PASS?.trim() || "";
  const testText =
    "Pseudoephedrine hydrochloride is a decongestant. Chlorpheniramine maleate is an antihistamine.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">الإعدادات</h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">إعدادات الموقع ومفاتيح الترجمة (محفوظة في قاعدة البيانات).</p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          for (const k of keys) {
            await setSetting(k, String(formData.get(k) || ""));
          }

          for (const k of themeKeys) {
            await setSetting(k, String(formData.get(k) || ""));
          }
        }}
        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {keys.map((k) => {
            const isKeysField = k === "translate_gemini_api_keys" || k === "translate_groq_api_keys";
            const isLong = k.startsWith("default_meta_") || isKeysField;
            return (
              <label key={k} className={isLong ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{k}</div>
                {isLong ? (
                  <textarea
                    name={k}
                    defaultValue={map.get(k) ?? ""}
                    rows={isKeysField ? 5 : 3}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm dark:border-zinc-800 dark:bg-black"
                  />
                ) : (
                  <input
                    name={k}
                    defaultValue={map.get(k) ?? ""}
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">ألوان الثيم</div>
          <div className="mt-1 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
            اترك الحقل فارغًا ثم احفظ لإرجاع اللون للوضع الافتراضي.
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {themeKeys.map((k) => (
              <label key={k} className="space-y-2">
                <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{k}</div>
                <div className="flex items-center gap-3">
                  <input
                    name={k}
                    defaultValue={map.get(k) ?? ""}
                    placeholder="#16a34a"
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-black"
                  />
                  <input
                    type="color"
                    defaultValue={(map.get(k) ?? "").trim() || "#16a34a"}
                    onChange={(e) => {
                      const form = (e.currentTarget as HTMLInputElement).form;
                      const target = form?.elements.namedItem(k);
                      if (target && target instanceof HTMLInputElement) target.value = e.currentTarget.value;
                    }}
                    className="h-11 w-14 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-black"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`/api/emergency-clear-cache?lang=ar&secret=${encodeURIComponent(emergencySecret)}`}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            مسح كاش الترجمة العربية (طوارئ)
          </a>
          <div className="text-xs leading-6 text-zinc-600 dark:text-zinc-400">
            سيتم تمرير <code>secret</code> تلقائيًا من <code>ADMIN_PASS</code>.
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">اختبار الترجمة</div>
          <div className="mt-1 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
            هذه الروابط تستخدم API داخلي لاختبار المزوّد والمفتاح الفعّال، وتؤكد أن تنظيف الرموز الغريبة يعمل.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/api/admin/translate/test?field=description&text=${encodeURIComponent(testText)}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              اختبار (وصف)
            </a>
            <a
              href={`/api/admin/translate/test?field=name&text=${encodeURIComponent("Clarinase 12 Hour")}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-950 hover:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:border-zinc-600"
            >
              اختبار (اسم/ترانسلِتيريشن)
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover)"
          >
            حفظ الإعدادات
          </button>
        </div>
      </form>
    </div>
  );
}
