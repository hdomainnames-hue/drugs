import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// EMERGENCY: This route is TEMPORARY to clear cache when Basic Auth fails.
// It uses a hardcoded secret from env to verify the request.
async function handle(req: Request) {
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
      where: { lang },
    });

    return NextResponse.json({
      ok: true,
      message: `Cache cleared for ${lang}`,
      deleted: result.count,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
