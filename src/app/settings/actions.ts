"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { del } from "@vercel/blob";

export async function deleteAccount(data: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const password = data.get("password") as string;
  const confirmText = data.get("confirm") as string;

  if (confirmText !== "ELIMINAR") {
    return { error: "Debes escribir ELIMINAR para confirmar" };
  }

  if (!password || password.length < 6) {
    return { error: "Contraseña requerida" };
  }

  const { compare } = await import("bcryptjs");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, avatarUrl: true },
  });

  if (!user) return { error: "Usuario no encontrado" };

  const valid = await compare(password, user.password);
  if (!valid) return { error: "Contraseña incorrecta" };

  try {
    if (user.avatarUrl) {
      await del(user.avatarUrl);
    }
  } catch {
    // Non-critical — blob may already be deleted
  }

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
    return { success: true };
  } catch (e) {
    console.error("Delete account error:", e);
    return { error: "Error al eliminar la cuenta" };
  }
}
