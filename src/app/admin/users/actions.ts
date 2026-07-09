"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Acceso denegado");
  }
}

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "ADMIN"]),
});

export async function getUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(data: FormData) {
  await requireAdmin();

  const raw = {
    id: data.get("id") as string,
    name: data.get("name") as string,
    email: data.get("email") as string,
    username: data.get("username") as string,
    password: (data.get("password") as string) || undefined,
    role: data.get("role") as "USER" | "ADMIN",
  };

  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const updateData: any = {
    name: parsed.data.name,
    email: parsed.data.email,
    username: parsed.data.username,
    role: parsed.data.role,
  };

  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: updateData,
  });
}

export async function deleteUser(id: string) {
  await requireAdmin();

  await prisma.user.delete({ where: { id } });
}