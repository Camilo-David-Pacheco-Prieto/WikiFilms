import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const contentId = searchParams.get("contentId");
    const type = searchParams.get("type");

    if (contentId && type) {
      const numId = Number(contentId);
      if (isNaN(numId)) {
        return NextResponse.json({ error: "Invalid contentId" }, { status: 400 });
      }
      const item = await prisma.watchlistItem.findUnique({
        where: {
          userId_contentId_type: {
            userId: session.user.id,
            contentId: numId,
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
  } catch (e) {
    console.error("GET watchlist error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, title, posterUrl, type, status } = await req.json();

    if (typeof contentId !== "number" || !title || !type || !status) {
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
  } catch (e) {
    console.error("POST watchlist error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
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

    const numId = Number(contentId);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid contentId" }, { status: 400 });
    }

    await prisma.watchlistItem.delete({
      where: {
        userId_contentId_type: {
          userId: session.user.id,
          contentId: numId,
          type,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("DELETE watchlist error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
