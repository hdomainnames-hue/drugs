import { geminiTranslateText, getGeminiKeysFromEnv } from "./gemini";
import { prisma } from "@/lib/prisma";

export type TranslateContext = {
  entityType?: string;
  field?: string;
  targetLang: "ar";
};

/**
 * Gemini Translation Wrapper
 */
type TranslateSettings = {
  activeProvider?: "gemini" | "groq";
  geminiApiKeys?: string[];
  groqApiKeys?: string[];
  geminiModel?: string;
  groqModel?: string;
  activeGeminiKeyIndex?: number;
};

let settingsCache:
  | {
      at: number;
      value: TranslateSettings;
    }
  | null = null;

async function getTranslateSettings(): Promise<TranslateSettings> {
  const now = Date.now();
  if (settingsCache && now - settingsCache.at < 30_000) return settingsCache.value;

  const keys = [
    "translate_active_provider",
    "translate_gemini_api_keys",
    "translate_groq_api_keys",
    "translate_gemini_model",
    "translate_groq_model",
    "translate_active_gemini_key_index",
  ];

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const normalizeKeyList = (raw: string | undefined) =>
    (raw ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const activeProviderRaw = (map.get("translate_active_provider") ?? "").trim().toLowerCase();
  const activeProvider = activeProviderRaw === "groq" ? "groq" : activeProviderRaw === "gemini" ? "gemini" : undefined;

  const activeGeminiKeyIndex = (() => {
    const raw = (map.get("translate_active_gemini_key_index") ?? "").trim();
    if (!raw) return undefined;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return undefined;
    return n;
  })();

  const value: TranslateSettings = {
    activeProvider,
    geminiApiKeys: normalizeKeyList(map.get("translate_gemini_api_keys")),
    groqApiKeys: normalizeKeyList(map.get("translate_groq_api_keys")),
    geminiModel: (map.get("translate_gemini_model") ?? "").trim() || undefined,
    groqModel: (map.get("translate_groq_model") ?? "").trim() || undefined,
    activeGeminiKeyIndex,
  };

  settingsCache = { at: now, value };
  return value;
}

export async function hasTranslationProviderAvailable() {
  if (getGeminiKeysFromEnv().length > 0) return true;
  if ((process.env.GROQ_API_KEY || "").split(",").map((key) => key.trim()).filter(Boolean).length > 0) return true;

  const settings = await getTranslateSettings();
  return Boolean(settings.geminiApiKeys?.length || settings.groqApiKeys?.length);
}

async function translateWithGemini(text: string): Promise<string> {
  const settings = await getTranslateSettings();
  const fromDb = settings.geminiApiKeys?.length ? settings.geminiApiKeys : undefined;
  const envKeys = getGeminiKeysFromEnv();
  const keys = fromDb?.length ? fromDb : envKeys;
  const chosenKeys =
    typeof settings.activeGeminiKeyIndex === "number" && keys[settings.activeGeminiKeyIndex]
      ? [keys[settings.activeGeminiKeyIndex]]
      : keys;

  if (settings.geminiModel) process.env.GEMINI_MODEL = settings.geminiModel;
  return geminiTranslateText({ apiKeys: chosenKeys, text, targetLang: "ar" as const });
}

function normalizeUnicode(s: string) {
  // Normalize fullwidth latin to ASCII, then normalize compatibility forms
  // NFKC also converts some exotic forms to normal ones.
  const nfkc = s.normalize("NFKC");
  return nfkc;
}

function latinToArabicApprox(s: string) {
  const lower = s.toLowerCase();

  // Handle common digraphs first
  let out = lower
    .replace(/ph/g, "ف")
    .replace(/sh/g, "ش")
    .replace(/ch/g, "تش")
    .replace(/th/g, "ث")
    .replace(/kh/g, "خ")
    .replace(/gh/g, "غ")
    .replace(/ck/g, "ك")
    .replace(/qu/g, "كو");

  const map: Record<string, string> = {
    a: "ا",
    b: "ب",
    c: "ك",
    d: "د",
    e: "ي",
    f: "ف",
    g: "ج",
    h: "ه",
    i: "ي",
    j: "ج",
    k: "ك",
    l: "ل",
    m: "م",
    n: "ن",
    o: "و",
    p: "ب",
    q: "ق",
    r: "ر",
    s: "س",
    t: "ت",
    u: "و",
    v: "ف",
    w: "و",
    x: "كس",
    y: "ي",
    z: "ز",
  };

  out = out.replace(/[a-z]/g, (ch) => map[ch] ?? "");
  return out;
}

function cleanupArabicOutput(s: string) {
  let out = normalizeUnicode(s);

  // Remove common markdown fences/quotes if model adds them
  out = out
    .replace(/^```[a-zA-Z]*\s*/g, "")
    .replace(/```$/g, "")
    .replace(/^\s*["']|["']\s*$/g, "")
    .trim();

  // Fix mixed-script words (Arabic+Latin) by transliterating Latin fragments
  // to a rough Arabic approximation instead of deleting (prevents context loss).
  // Examples:
  // - "السالmonلا" -> "السالمونلا"
  // - "باراسيتامol" -> "باراسيتامول"
  // - "paraسيتامول" -> "باراسيتامول"
  out = out
    .replace(/([\u0600-\u06FF]+)([a-zA-Z]{1,16})([\u0600-\u06FF]+)/g, (_m, a, latin, b) => {
      return `${a}${latinToArabicApprox(String(latin))}${b}`;
    })
    .replace(/([\u0600-\u06FF]+)([a-zA-Z]{1,16})/g, (_m, a, latin) => {
      return `${a}${latinToArabicApprox(String(latin))}`;
    })
    .replace(/([a-zA-Z]{1,16})([\u0600-\u06FF]+)/g, (_m, latin, b) => {
      return `${latinToArabicApprox(String(latin))}${b}`;
    });

  // Remove stray standalone Latin words that sometimes leak into Arabic output.
  // Keep typical dosage/units patterns and common clinical abbreviations.
  // NOTE: We keep them case-insensitive by normalizing NFKC above but preserve original case.
  out = out.replace(
    /\b(?!mg\b|ml\b|mcg\b|g\b|kg\b|iu\b|%\b|°c\b|bpm\b|hr\b|h\b|min\b|day\b|bid\b|tid\b|qid\b|prn\b|po\b|iv\b|im\b|sc\b|od\b|os\b|ou\b)[a-zA-Z]+\b/g,
    "",
  );
  // Remove any remaining zero-width and control characters
  out = out.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, "");

  // Remove CJK / Hangul / Kana characters that should never appear in Arabic output
  out = out.replace(/[\u3400-\u9FFF\u3040-\u30FF\u31F0-\u31FF\uAC00-\uD7AF]/g, "");

  // If a model prepends a stray standalone "ي" at the beginning of a line due to mixed-script leakage, remove it.
  out = out.replace(/(^|\n)\s*ي\s+(?=[\u0600-\u06FF])/g, "$1");

  // Collapse extra spaces created by removals
  out = out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([،.؛:])/g, "$1")
    .replace(/([،؛:])\s*/g, "$1 ")
    .trim();

  return out;
}

function buildGroqMessages(text: string, ctx: TranslateContext) {
  const isNameLike = ctx.field === "name" || ctx.field === "company" || ctx.field === "activeIngredient";

  if (isNameLike) {
    const system =
      "You are a medical/pharmaceutical transliteration engine. " +
      "Your job is NOT to translate meaning for brand names or company names. " +
      "If the input is Latin brand/company name, keep it as-is OR produce a phonetic Arabic transliteration without translating meaning. " +
      "NEVER translate words like 'cold' into 'برد' when it is part of a brand name. " +
      "Preserve numbers, dosage strengths, and units (mg, mL, mcg, IU, %, °C) exactly. " +
      "Do not add words like (دواء) or (شركة). " +
      "Output ONLY the Arabic transliteration text, no quotes, no markdown.";

    const user =
      "Task: Arabic-script transliteration (no semantic translation).\n" +
      "Input:\n" +
      text;

    return { system, user };
  }

  const system =
    "You are a professional medical/pharmaceutical translator. " +
    "Translate faithfully to Modern Standard Arabic using correct clinical terminology. " +
    "Do not add any extra information, warnings, or commentary. " +
    "Preserve numbers, units, dosages (mg, mL, mcg, IU), frequencies, and drug names as proper nouns. " +
    "Avoid Latin letters in the output except for standard units (mg, mL, mcg, IU, %, °C) and universally written abbreviations when required. " +
    "Use a professional clinical style suitable for patient information leaflets. " +
    "Prefer concise, medically accurate phrasing. Avoid colloquial wording. " +
    "If the input contains headings or label-like lines, keep them as clear Arabic medical headings. " +
    "Keep list formatting (one item per line) when the input is a list. " +
    "Use these preferred medical terms when applicable: " +
    "Mechanism of Action=آلية العمل; MoA=آلية العمل; " +
    "Mechanism=الآلية; Mechanistic=آلي; " +
    "Administration=طريقة الاستعمال; How to use=طريقة الاستعمال; " +
    "Dosage=الجرعة; Dosing=الجرعات; " +
    "Dose=جرعة; Dose adjustment=تعديل الجرعة; " +
    "Frequency=معدل التكرار; Once daily=مرة واحدة يومياً; Twice daily=مرتين يومياً; " +
    "Precautions=احتياطات; Warnings=تحذيرات; " +
    "Overdose=جرعة زائدة; " +
    "Drug Interactions=التداخلات الدوائية; Interactions=التداخلات الدوائية; " +
    "Adverse Effects=الآثار الجانبية; Side Effects=الآثار الجانبية; " +
    "Common=شائع; Rare=نادر; " +
    "Contraindications=موانع الاستعمال; " +
    "Contraindicated=مضاد استطباب; " +
    "Storage=الحفظ; " +
    "Pregnancy and Lactation=الحمل والرضاعة; " +
    "Indication=دواعي الاستعمال; Indications=دواعي الاستعمال; " +
    "Therapeutic class=الفئة العلاجية; Pharmacological class=الفئة الدوائية; " +
    "Onset=بدء التأثير; Duration=مدة التأثير; " +
    "Half-life=نصف العمر; Metabolism=الأيض; Excretion=الإطراح; " +
    "Renal impairment=قصور كلوي; Hepatic impairment=قصور كبدي; " +
    "Pediatric=الأطفال; Geriatric=كبار السن; " +
    "runny nose=سيلان الأنف; blocked nose=احتقان الأنف; sinus=الجيوب الأنفية; " +
    "sneezing=العطاس; watery itchy eyes=حكة ودمع العينين; sinus pain=ألم الجيوب الأنفية; " +
    "fever=حمّى; headache=صداع; body aches=آلام الجسم; body aches & pain=آلام الجسم. " +
    "Output ONLY the Arabic translation text, no quotes, no markdown.";

  const user =
    `Context: entity=${ctx.entityType ?? ""} field=${ctx.field ?? ""}.\n` +
    "Text:\n" +
    text;

  return { system, user };
}

/**
 * Groq Translation Provider (Placeholder for future implementation)
 */
async function translateWithGroq(text: string, ctx: TranslateContext): Promise<string> {
  const settings = await getTranslateSettings();
  const apiKeys = (settings.groqApiKeys?.length ? settings.groqApiKeys : undefined) ??
    (process.env.GROQ_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  
  if (apiKeys.length === 0) throw new Error("GROQ_API_KEY not configured");

  // Simple rotation/randomization for Groq keys
  const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  const model = settings.groqModel || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const { system, user } = buildGroqMessages(text, ctx);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const translated = data.choices?.[0]?.message?.content?.trim() || "";

  return cleanupArabicOutput(translated);
}

/**
 * Orchestrates translation using available providers with fallback logic
 */
export async function translateText(text: string, ctx: TranslateContext): Promise<string> {
  const settings = await getTranslateSettings();
  const skipGemini = ctx.field === "name" || ctx.field === "company";
  const forceGroq = settings.activeProvider === "groq";
  const forceGemini = settings.activeProvider === "gemini";

  // 1. Try Gemini first (preferred)
  if (!forceGroq && (forceGemini || !skipGemini)) {
    try {
      const geminiResult = await translateWithGemini(text);
      if (geminiResult && geminiResult !== text) return geminiResult;
    } catch (err) {
      console.error("Gemini translation failed, trying fallback...", err instanceof Error ? err.message : err);
    }
  }

  // 2. Try Groq as fallback if key is available
  if (forceGroq || settings.groqApiKeys?.length || process.env.GROQ_API_KEY) {
    try {
      const groqResult = await translateWithGroq(text, ctx);
      if (groqResult && groqResult !== text) return groqResult;
    } catch (err) {
      console.error("Groq translation failed:", err instanceof Error ? err.message : err);
    }
  }

  throw new Error("All translation providers failed");
}
