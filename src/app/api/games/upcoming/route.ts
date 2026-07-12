import { NextResponse } from "next/server";
import { getUpcomingGames } from "@/lib/igdb";

export async function GET() {
  try {
    const results = await getUpcomingGames(20);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("IGDB upcoming error:", err);
    return NextResponse.json({ error: "Failed to fetch upcoming games" }, { status: 500 });
  }
}
