"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function markMessageDone(idRaw: string) {
  const id = BigInt(idRaw);
  await prisma.contactMessage.update({
    where: { id },
    data: { status: "done" },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${idRaw}`);
}

export async function markMessageNew(idRaw: string) {
  const id = BigInt(idRaw);
  await prisma.contactMessage.update({
    where: { id },
    data: { status: "new" },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${idRaw}`);
}

export async function replyToMessage(idRaw: string, formData: FormData) {
  const id = BigInt(idRaw);
  const reply = String(formData.get("reply") || "").trim();

  if (!reply) throw new Error("Missing reply");

  await prisma.contactMessage.update({
    where: { id },
    data: {
      reply,
      status: "replied",
      repliedAt: new Date(),
    },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${idRaw}`);
  redirect(`/admin/messages/${idRaw}`);
}
