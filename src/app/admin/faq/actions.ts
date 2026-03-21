"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpsertFaqInput = {
  id?: string;
  lang: string;
  question: string;
  answer: string;
  order: number;
};

export async function upsertFaq(input: UpsertFaqInput) {
  const lang = input.lang === "en" ? "en" : "ar";
  const question = input.question.trim();
  const answer = input.answer.trim();
  const order = Number.isFinite(input.order) ? input.order : 0;

  if (!question || !answer) throw new Error("Missing required fields");

  if (input.id) {
    await prisma.faq.update({
      where: { id: BigInt(input.id) },
      data: { lang, question, answer, order },
    });
  } else {
    await prisma.faq.create({
      data: { lang, question, answer, order },
    });
  }

  revalidatePath("/admin/faq");
  revalidatePath(`/ar/faq`);
  revalidatePath(`/en/faq`);
}

export async function deleteFaq(id: string) {
  await prisma.faq.delete({ where: { id: BigInt(id) } });
  revalidatePath("/admin/faq");
  revalidatePath(`/ar/faq`);
  revalidatePath(`/en/faq`);
}
