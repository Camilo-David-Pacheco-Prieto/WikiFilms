import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/igdb";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchGames(q.trim());
    return NextResponse.json({ results });
  } catch (err) {
    console.error("IGDB search error:", err);
    return NextResponse.json({ error: "Failed to search games" }, { status: 500 });
  }
}
