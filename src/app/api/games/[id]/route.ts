import { NextRequest, NextResponse } from "next/server";
import { getGameById } from "@/lib/igdb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game id" }, { status: 400 });
  }

  try {
    const game = await getGameById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch (err) {
    console.error("IGDB game detail error:", err);
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}
