"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setSetting(key: string, value: string) {
  const k = key.trim();
  if (!k) throw new Error("Missing key");

  if (k.startsWith("theme_") && !String(value ?? "").trim()) {
    await prisma.siteSetting.deleteMany({ where: { key: k } });
    revalidatePath("/admin/settings");
    revalidatePath("/ar");
    revalidatePath("/en");
    return;
  }

  await prisma.siteSetting.upsert({
    where: { key: k },
    update: { value },
    create: { key: k, value },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/ar");
  revalidatePath("/en");
}
