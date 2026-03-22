import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// EMERGENCY: This route is TEMPORARY to clear cache when Basic Auth fails.
// It uses a hardcoded secret from env to verify the request.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const lang = url.searchParams.get("lang") || "ar";

  // Use ADMIN_PASS as the secret for this emergency clear
  const expectedSecret = process.env.ADMIN_PASS?.trim();

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.translation.deleteMany({
      where: { lang: lang as any },
    });

    return NextResponse.json({
      ok: true,
      message: `Cache cleared for ${lang}`,
      deleted: result.count,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
