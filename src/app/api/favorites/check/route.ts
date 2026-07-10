import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");

  if (!contentId) {
    return NextResponse.json({ error: "Falta contentId" }, { status: 400 });
  }

  const fav = await prisma.favorite.findUnique({
    where: {
      userId_contentId: {
        userId: session.user.id,
        contentId: Number(contentId),
      },
    },
  });

  return NextResponse.json({ favorited: !!fav });
}
