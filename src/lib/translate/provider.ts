import { geminiTranslateText, getGeminiKeysFromEnv } from "./gemini";

/**
 * Interface for translation providers
 */
interface TranslationProvider {
  name: string;
  translate: (text: string, targetLang: string) => Promise<string>;
}

/**
 * Gemini Translation Wrapper
 */
async function translateWithGemini(text: string): Promise<string> {
  const keys = getGeminiKeysFromEnv();
  return geminiTranslateText({ apiKeys: keys, text, targetLang: "ar" as const });
}

/**
 * Groq Translation Provider (Placeholder for future implementation)
 */
async function translateWithGroq(text: string, targetLang: string): Promise<string> {
  const apiKeysStr = process.env.GROQ_API_KEY || "";
  const apiKeys = apiKeysStr.split(",").map(k => k.trim()).filter(Boolean);
  
  if (apiKeys.length === 0) throw new Error("GROQ_API_KEY not configured");

  // Simple rotation/randomization for Groq keys
  const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const targetLanguageName = targetLang === "ar" ? "Arabic" : "English";

  const system =
    "You are a professional medical/pharmaceutical translator. " +
    "Translate faithfully with correct terminology. " +
    "Do not add any extra information, warnings, or commentary. " +
    "Preserve numbers, units, dosages (mg, mL, mcg, IU), frequencies, and brand/generic names. " +
    "If the input already contains Arabic, keep it unchanged. " +
    "Output ONLY the translation text, no quotes, no markdown.";

  const user =
    `Target language: ${targetLanguageName}.\n` +
    "Text:\n" +
    text;

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
  let translated = data.choices?.[0]?.message?.content?.trim() || "";
  
  // Clean up any potential markdown or quotes Groq might add
  translated = translated
    .replace(/^```[a-zA-Z]*\s*/g, "")
    .replace(/```$/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
  
  return translated;
}

/**
 * Orchestrates translation using available providers with fallback logic
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  // 1. Try Gemini first (preferred)
  try {
    const geminiResult = await translateWithGemini(text);
    if (geminiResult && geminiResult !== text) return geminiResult;
  } catch (err) {
    console.error("Gemini translation failed, trying fallback...", err instanceof Error ? err.message : err);
  }

  // 2. Try Groq as fallback if key is available
  if (process.env.GROQ_API_KEY) {
    try {
      const groqResult = await translateWithGroq(text, targetLang);
      if (groqResult && groqResult !== text) return groqResult;
    } catch (err) {
      console.error("Groq translation failed:", err instanceof Error ? err.message : err);
    }
  }

  throw new Error("All translation providers failed");
}
