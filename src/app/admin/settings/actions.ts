"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setSetting(key: string, value: string) {
  const k = key.trim();
  if (!k) throw new Error("Missing key");

  await prisma.siteSetting.upsert({
    where: { key: k },
    update: { value },
    create: { key: k, value },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/ar");
  revalidatePath("/en");
}
