import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$executeRaw`
      UPDATE "Notification"
      SET "read" = true
      WHERE "userId" = ${session.user.id} AND "read" = false
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST read-all error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
