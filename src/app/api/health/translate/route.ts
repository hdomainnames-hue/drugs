import { NextResponse } from "next/server";

import { geminiTranslateText, getGeminiKeysFromEnv } from "@/lib/translate/gemini";

export async function GET() {
  const keys = getGeminiKeysFromEnv();
  const hasKeys = keys.length > 0;

  if (!hasKeys) {
    return NextResponse.json(
      {
        ok: false,
        hasKeys,
        keyCount: keys.length,
        error: "Missing GEMINI_API_KEYS",
      },
      { status: 500 },
    );
  }

  try {
    const translated = await geminiTranslateText({
      apiKeys: keys,
      text: "Hello",
      targetLang: "ar",
    });

    return NextResponse.json({
      ok: true,
      hasKeys,
      keyCount: keys.length,
      sample: translated,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        hasKeys,
        keyCount: keys.length,
        error: msg,
      },
      { status: 500 },
    );
  }
}
