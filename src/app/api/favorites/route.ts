import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { contentId, title, posterUrl, type } = await req.json();

  if (!contentId || !title || !type) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_contentId: { userId: session.user.id, contentId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

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
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { contentId } = await req.json();

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, contentId },
  });

  return NextResponse.json({ success: true });
}
