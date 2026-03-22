import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message || message.length < 5) {
    return NextResponse.json({ ok: false, error: "Message is too short" }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ ok: false, error: "Message is too long" }, { status: 400 });
  }

  const created = await prisma.contactMessage.create({
    data: {
      name: name || null,
      email: email || null,
      subject: subject || null,
      message,
      status: "new",
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: String(created.id) });
}
