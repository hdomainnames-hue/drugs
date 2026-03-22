import { NextResponse } from "next/server";

import { translateText } from "@/lib/translate/provider";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = (url.searchParams.get("text") || "Pseudoephedrine hydrochloride is a decongestant").trim();
  const field = (url.searchParams.get("field") || "description").trim();

  try {
    const translated = await translateText(text, {
      entityType: "Health" as any,
      field,
      targetLang: "ar",
    });

    return NextResponse.json({ ok: true, text, field, translated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
