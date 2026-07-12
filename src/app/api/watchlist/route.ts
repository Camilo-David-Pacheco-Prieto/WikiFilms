import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const contentId = searchParams.get("contentId");
  const type = searchParams.get("type");

  if (contentId && type) {
    const item = await prisma.watchlistItem.findUnique({
      where: {
        userId_contentId_type: {
          userId: session.user.id,
          contentId: Number(contentId),
          type,
        },
      },
    });
    return NextResponse.json(item);
  }

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status === "WATCHED" || status === "PLAN_TO_WATCH") {
    where.status = status;
  }

  const items = await prisma.watchlistItem.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId, title, posterUrl, type, status } = await req.json();

  if (!contentId || !title || !type || !status) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  if (status !== "WATCHED" && status !== "PLAN_TO_WATCH") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const item = await prisma.watchlistItem.upsert({
    where: {
      userId_contentId_type: { userId: session.user.id, contentId, type },
    },
    update: { status, title, posterUrl, type },
    create: {
      userId: session.user.id,
      contentId,
      title,
      posterUrl,
      type,
      status,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");
  const type = searchParams.get("type");

  if (!contentId || !type) {
    return NextResponse.json({ error: "Falta contentId o type" }, { status: 400 });
  }

  await prisma.watchlistItem.delete({
    where: {
      userId_contentId_type: {
        userId: session.user.id,
        contentId: Number(contentId),
        type,
      },
    },
  });

  return NextResponse.json({ success: true });
}
