import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");

  if (!contentId) {
    return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { contentId: Number(contentId) },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId, rating, comment } = await req.json();

  if (!contentId || !rating || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (comment && comment.length > 500) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: {
      userId_contentId: { userId: session.user.id, contentId },
    },
    update: { rating, comment },
    create: { userId: session.user.id, contentId, rating, comment },
  });

  return NextResponse.json(review);
}
