import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 2MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `avatars/${session.user.id}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(filename, buffer, {
      access: "private",
      contentType: file.type,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: blob.pathname },
    });

    const proxyUrl = `/api/blob?pathname=${encodeURIComponent(blob.pathname)}`;
    return NextResponse.json({ avatarUrl: proxyUrl });
  } catch (e) {
    console.error("Upload avatar error:", e);
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
