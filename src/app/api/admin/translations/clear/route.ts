import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "ar";

  if (lang !== "ar") {
    return NextResponse.json(
      {
        ok: false,
        error: "Only lang=ar is supported",
      },
      { status: 400 },
    );
  }

  const result = await prisma.translation.deleteMany({
    where: { lang: "ar" },
  });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    lang: "ar",
  });
}
