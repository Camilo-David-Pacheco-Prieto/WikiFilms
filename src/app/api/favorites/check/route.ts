import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

    const fav = await prisma.favorite.findUnique({
      where: {
        userId_contentId_type: {
          userId: session.user.id,
          contentId: numId,
          type,
        },
      },
    });

    return NextResponse.json({ favorited: !!fav });
  } catch (e) {
    console.error("GET favorites/check error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
