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
async function translateWithGemini(text: string, targetLang: string): Promise<string> {
  const keys = getGeminiKeysFromEnv();
  return geminiTranslateText({ apiKeys: keys, text, targetLang: "ar" });
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

  const prompt = `Translate the following drug-related text to ${
    targetLang === "ar" ? "Arabic" : "English"
  }. Return ONLY the translated text, no explanations, no chat, no quotes, no preamble. Use professional medical/pharmaceutical terminology: "${text}"`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  let translated = data.choices?.[0]?.message?.content?.trim() || "";
  
  // Clean up any potential markdown or quotes Groq might add
  translated = translated.replace(/^["']|["']$/g, "").trim();
  
  return translated;
}

/**
 * Orchestrates translation using available providers with fallback logic
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  // 1. Try Gemini first (preferred)
  try {
    const geminiResult = await translateWithGemini(text, targetLang);
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
