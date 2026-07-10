import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    const actorIds = [...new Set(notifications.map((n) => n.actorId))];
    const actors = actorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true },
        })
      : [];
    const actorMap = new Map(actors.map((a) => [a.id, a.name]));

    const result = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      actorId: n.actorId,
      actorName: actorMap.get(n.actorId) ?? "Unknown",
      type: n.type,
      reviewId: n.reviewId,
      contentId: n.contentId,
      contentType: n.contentType,
      read: n.read,
      createdAt: n.createdAt,
    }));

    return NextResponse.json({ notifications: result, unreadCount });
  } catch (e) {
    console.error("GET notifications error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE "Notification"
      SET "read" = true
      WHERE "id" = ${id} AND "userId" = ${session.user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH notification error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
