import { prisma } from "@/lib/prisma";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { sha256 } from "@/lib/translate/gemini";
import { hasTranslationProviderAvailable, translateText } from "@/lib/translate/provider";

type EntityType = "Drug" | "Article" | "FAQ";

type TranslateFieldRequest = {
  entityType: EntityType;
  entityId: string;
  field: string;
  sourceText: string;
};

export async function getOrTranslateFields(
  lang: Lang,
  reqs: TranslateFieldRequest[],
): Promise<Record<string, string>> {
  if (lang !== "ar") {
    const out: Record<string, string> = {};
    for (const r of reqs) out[`${r.entityType}:${r.entityId}:${r.field}`] = r.sourceText;
    return out;
  }

  const out: Record<string, string> = {};
  const byKey = (r: TranslateFieldRequest) => `${r.entityType}:${r.entityId}:${r.field}`;

  const normalizeSource = (s: string) => s.normalize("NFKC").trim();
  const hardcodedOverrides = new Map<string, string>([
    [normalizeSource("ABEVAC 1MG/ML VIAL"), "أبيفاك ١ مج/مل أمبول"],
    [normalizeSource("5FU 250MG/5ML VIAL(N/A)"), "5FU ٢٥٠ مج/٥ مل أمبول"],
    [normalizeSource("RISEFUTAL 5MG 7 F.C.TAB"), "رايزفوتال ٥ مج ٧ أقراص مغلفة"],
  ]);

  const uniqueReqs = reqs.filter((r) => r.sourceText && r.sourceText.trim());
  if (!uniqueReqs.length) return out;

  const overrideReqs: TranslateFieldRequest[] = [];
  const nonOverrideReqs: TranslateFieldRequest[] = [];
  for (const r of uniqueReqs) {
    const override = hardcodedOverrides.get(normalizeSource(r.sourceText));
    if (override) {
      out[byKey(r)] = override;
      overrideReqs.push(r);
    } else {
      nonOverrideReqs.push(r);
    }
  }

  if (overrideReqs.length) {
    await Promise.all(
      overrideReqs.map(async (r) => {
        const translatedText = hardcodedOverrides.get(normalizeSource(r.sourceText))!;
        const h = sha256(r.sourceText);
        await prisma.translation.upsert({
          where: { entityType_entityId_field_lang: { entityType: r.entityType, entityId: r.entityId, field: r.field, lang } },
          create: {
            entityType: r.entityType,
            entityId: r.entityId,
            field: r.field,
            lang,
            sourceText: r.sourceText,
            sourceHash: h,
            translatedText,
          },
          update: {
            sourceText: r.sourceText,
            sourceHash: h,
            translatedText,
          },
        });
      }),
    );
  }

  const existing = await prisma.translation.findMany({
    where: {
      lang,
      OR: nonOverrideReqs.map((r) => ({
        entityType: r.entityType,
        entityId: r.entityId,
        field: r.field,
      })),
    },
    select: { entityType: true, entityId: true, field: true, sourceHash: true, translatedText: true },
  });

  const existingMap = new Map<string, { sourceHash: string; translatedText: string }>();
  for (const e of existing) existingMap.set(`${e.entityType}:${e.entityId}:${e.field}`, { sourceHash: e.sourceHash, translatedText: e.translatedText });

  const missing: TranslateFieldRequest[] = [];
  for (const r of nonOverrideReqs) {
    const k = byKey(r);
    const h = sha256(r.sourceText);
    const found = existingMap.get(k);
    if (found && found.sourceHash === h && found.translatedText) {
      out[k] = found.translatedText;
    } else {
      missing.push(r);
    }
  }

  const maxPerRequest = (() => {
    const raw = process.env.TRANSLATE_MAX_PER_REQUEST;
    const n = raw ? Number.parseInt(String(raw), 10) : 5;
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(50, n);
  })();

  const providerAvailable = maxPerRequest > 0 ? await hasTranslationProviderAvailable() : false;
  if (!providerAvailable) {
    for (const r of missing) {
      out[byKey(r)] = t(lang, "translationPending");
    }
    return out;
  }

  const toTranslate = maxPerRequest > 0 ? missing.slice(0, maxPerRequest) : [];
  const skipped = maxPerRequest > 0 ? missing.slice(maxPerRequest) : missing;

  for (const r of skipped) {
    out[byKey(r)] = t(lang, "translationPending");
  }

  for (const r of toTranslate) {
    const k = byKey(r);
    const h = sha256(r.sourceText);
    try {
      const translatedText = await translateText(r.sourceText, {
        entityType: r.entityType,
        field: r.field,
        targetLang: "ar",
      });
      await prisma.translation.upsert({
        where: { entityType_entityId_field_lang: { entityType: r.entityType, entityId: r.entityId, field: r.field, lang } },
        create: {
          entityType: r.entityType,
          entityId: r.entityId,
          field: r.field,
          lang,
          sourceText: r.sourceText,
          sourceHash: h,
          translatedText,
        },
        update: {
          sourceText: r.sourceText,
          sourceHash: h,
          translatedText,
        },
      });
      out[k] = translatedText;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Translation failed for request", {
        entityType: r.entityType,
        entityId: r.entityId,
        field: r.field,
        sourceHash: h,
        error: msg,
      });
      out[k] = t(lang, "translationPending");
    }
  }

  return out;
}
