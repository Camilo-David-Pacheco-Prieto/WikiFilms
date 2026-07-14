import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (e) {
    console.error("GET favorites error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId, title, posterUrl, type } = await req.json();

  if (typeof contentId !== "number" || !title || !type) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        contentId,
        title,
        posterUrl,
        type,
      },
    });
    return NextResponse.json({ favorited: true });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      try {
        await prisma.favorite.delete({
          where: {
            userId_contentId_type: { userId: session.user.id, contentId, type },
          },
        });
      } catch (deleteErr) {
        if (
          deleteErr instanceof Prisma.PrismaClientKnownRequestError &&
          deleteErr.code === "P2025"
        ) {
          // already deleted by another request
        } else {
          console.error("DELETE during toggle error:", deleteErr);
          return NextResponse.json({ error: "Internal error" }, { status: 500 });
        }
      }
      return NextResponse.json({ favorited: false });
    }
    console.error("POST favorites error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, type } = await req.json();

    if (typeof contentId !== "number" || !type) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await prisma.favorite.delete({
      where: {
        userId_contentId_type: { userId: session.user.id, contentId, type },
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
    console.error("DELETE favorites error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
