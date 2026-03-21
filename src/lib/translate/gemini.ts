import crypto from "node:crypto";

type GeminiTranslateOptions = {
  apiKeys: string[];
  text: string;
  targetLang: "ar";
};

function normalizeKeys(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

let keyIndex = 0;
function getNextKey(keys: string[]) {
  if (!keys.length) return null;
  const k = keys[keyIndex % keys.length];
  keyIndex += 1;
  return k;
}

export function sha256(text: string) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export async function geminiTranslateText({ apiKeys, text, targetLang }: GeminiTranslateOptions): Promise<string> {
  const model = (process.env.GEMINI_MODEL && String(process.env.GEMINI_MODEL).trim()) || "gemini-2.0-flash";

  const timeoutMs = (() => {
    const raw = process.env.GEMINI_TIMEOUT_MS;
    const n = raw ? Number.parseInt(String(raw), 10) : 5000;
    if (!Number.isFinite(n) || n <= 0) return 5000;
    return Math.min(30_000, n);
  })();

  const maxAttempts = Math.max(1, Math.min(6, apiKeys.length ? apiKeys.length * 2 : 1));
  let lastErr: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const key = getNextKey(apiKeys);
    if (!key) throw new Error("Missing GEMINI_API_KEYS");

    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const prompt =
    targetLang === "ar"
      ? "Translate the following text to Modern Standard Arabic. Keep medical terms accurate. Keep names as proper nouns when appropriate. Return ONLY the Arabic translation, no quotes, no extra commentary.\n\nText:\n" +
        text
      : text;

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      }),
      signal: ac.signal,
    }).finally(() => clearTimeout(timer));

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const msg = `Gemini translate failed: ${res.status} ${res.statusText} ${body}`;

      const isQuota =
        res.status === 429 ||
        /RESOURCE_EXHAUSTED|rate limit|quota/i.test(body) ||
        /RESOURCE_EXHAUSTED|rate limit|quota/i.test(res.statusText);

      if (isQuota && attempt < maxAttempts - 1) {
        // Fail-fast: don't sleep inside serverless. Rotate keys immediately.
        lastErr = new Error(msg);
        continue;
      }

      throw new Error(msg);
    }

    const data = (await res.json()) as any;
    const out =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .join("")
        .trim() ?? "";

    if (!out) throw new Error("Gemini translate returned empty output");
    return out;
  }

  throw lastErr instanceof Error ? lastErr : new Error("Gemini translate failed after retries");
}

export function getGeminiKeysFromEnv() {
  return normalizeKeys(process.env.GEMINI_API_KEYS);
}
