"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

type RoleValue = "admin" | "editor" | "viewer";

function normalizeRole(raw: string): RoleValue {
  const v = raw.trim();
  if (v === "admin" || v === "editor" || v === "viewer") return v;
  return "viewer";
}

export async function createUser(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim() || null;
  const role = normalizeRole(String(formData.get("role") || "viewer"));
  const disabled = Boolean(formData.get("disabled"));
  const password = String(formData.get("password") || "");

  if (!email) throw new Error("Missing email");
  if (!password || password.length < 8) throw new Error("Password must be at least 8 characters");

  await prisma.user.create({
    data: {
      email,
      name,
      role,
      disabled,
      passwordHash: hashPassword(password),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(userId: string, formData: FormData) {
  const id = Number.parseInt(userId, 10);
  if (!Number.isFinite(id)) throw new Error("Invalid user id");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim() || null;
  const role = normalizeRole(String(formData.get("role") || "viewer"));
  const disabled = Boolean(formData.get("disabled"));
  const password = String(formData.get("password") || "");

  if (!email) throw new Error("Missing email");

  const data: {
    email: string;
    name: string | null;
    role: RoleValue;
    disabled: boolean;
    passwordHash?: string;
  } = {
    email,
    name,
    role,
    disabled,
  };

  if (password && password.length >= 8) {
    data.passwordHash = hashPassword(password);
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect("/admin/users");
}

export async function deleteUser(userId: string) {
  const id = Number.parseInt(userId, 10);
  if (!Number.isFinite(id)) throw new Error("Invalid user id");

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
