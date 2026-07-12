import { NextResponse } from "next/server";
import { getPopularGames } from "@/lib/igdb";

export async function GET() {
  try {
    const results = await getPopularGames(20);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("IGDB popular error:", err);
    return NextResponse.json({ error: "Failed to fetch popular games" }, { status: 500 });
  }
}
