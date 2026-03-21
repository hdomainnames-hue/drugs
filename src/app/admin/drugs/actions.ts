"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateDrugInput = {
  remoteId: number;
  name: string;
  company?: string;
  activeIngredient?: string;
  price?: string;
  description?: string;
  metaDescription?: string;
};

export async function updateDrug(input: UpdateDrugInput) {
  const remoteId = Number(input.remoteId);
  if (!Number.isFinite(remoteId) || remoteId <= 0) throw new Error("Invalid remoteId");

  await prisma.drug.update({
    where: { remoteId },
    data: {
      name: input.name.trim(),
      company: input.company?.trim() || null,
      activeIngredient: input.activeIngredient?.trim() || null,
      price: input.price?.trim() || null,
      description: input.description?.trim() || null,
      metaDescription: input.metaDescription?.trim() || null,
    },
  });

  revalidatePath("/admin/drugs");
  revalidatePath(`/ar/drug/${remoteId}`);
  revalidatePath(`/en/drug/${remoteId}`);
}
