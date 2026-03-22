import { geminiTranslateText, getGeminiKeysFromEnv } from "./gemini";

export type TranslateContext = {
  entityType?: string;
  field?: string;
  targetLang: "ar";
};

/**
 * Gemini Translation Wrapper
 */
async function translateWithGemini(text: string): Promise<string> {
  const keys = getGeminiKeysFromEnv();
  return geminiTranslateText({ apiKeys: keys, text, targetLang: "ar" as const });
}

function normalizeUnicode(s: string) {
  // Normalize fullwidth latin to ASCII, then normalize compatibility forms
  // NFKC also converts some exotic forms to normal ones.
  const nfkc = s.normalize("NFKC");
  return nfkc;
}

function cleanupArabicOutput(s: string) {
  let out = normalizeUnicode(s);

  // Remove common markdown fences/quotes if model adds them
  out = out
    .replace(/^```[a-zA-Z]*\s*/g, "")
    .replace(/```$/g, "")
    .replace(/^\s*["']|["']\s*$/g, "")
    .trim();

  // Remove stray Latin letters that sometimes leak into Arabic output.
  // Keep typical dosage/units patterns and common clinical abbreviations.
  // NOTE: We keep them case-insensitive by normalizing NFKC above but preserve original case.
  out = out.replace(
    /\b(?!mg\b|ml\b|mcg\b|g\b|kg\b|iu\b|%\b|°c\b|bpm\b|hr\b|h\b|min\b|day\b|bid\b|tid\b|qid\b|prn\b|po\b|iv\b|im\b|sc\b|od\b|os\b|ou\b)[a-zA-Z]+\b/g,
    "",
  );
  // Remove any remaining zero-width and control characters
  out = out.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, "");
  // Collapse extra spaces created by removals
  out = out.replace(/[ \t]{2,}/g, " ").trim();

  return out;
}

function buildGroqMessages(text: string, ctx: TranslateContext) {
  const isNameLike = ctx.field === "name" || ctx.field === "company";

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
    "Keep list formatting (one item per line) when the input is a list. " +
    "Use these preferred medical terms when applicable: " +
    "Indication=دواعي الاستعمال; Indications=دواعي الاستعمال; " +
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
  const apiKeysStr = process.env.GROQ_API_KEY || "";
  const apiKeys = apiKeysStr.split(",").map(k => k.trim()).filter(Boolean);
  
  if (apiKeys.length === 0) throw new Error("GROQ_API_KEY not configured");

  // Simple rotation/randomization for Groq keys
  const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
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
  const skipGemini = ctx.field === "name" || ctx.field === "company";

  // 1. Try Gemini first (preferred)
  if (!skipGemini) {
    try {
      const geminiResult = await translateWithGemini(text);
      if (geminiResult && geminiResult !== text) return geminiResult;
    } catch (err) {
      console.error("Gemini translation failed, trying fallback...", err instanceof Error ? err.message : err);
    }
  }

  // 2. Try Groq as fallback if key is available
  if (process.env.GROQ_API_KEY) {
    try {
      const groqResult = await translateWithGroq(text, ctx);
      if (groqResult && groqResult !== text) return groqResult;
    } catch (err) {
      console.error("Groq translation failed:", err instanceof Error ? err.message : err);
    }
  }

  throw new Error("All translation providers failed");
}
