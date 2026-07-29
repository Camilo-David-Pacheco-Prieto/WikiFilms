import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");

  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const contentId = payload.contentId;
  const cacheKey = payload.cacheKey as string | undefined;
  const action = (payload.action as string) ?? "unknown";

  if (cacheKey) {
    try {
      await redis.del(cacheKey);
    } catch {
      // Non-critical
    }
  }

  if (contentId) {
    const patterns = [
      `cache:tmdb:*contentId=${contentId}*`,
      `cache:tmdb:*\/${contentId}*`,
    ];
    for (const pattern of patterns) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch {
        // Non-critical
      }
    }
  }

  return NextResponse.json({
    ok: true,
    action,
    contentId: contentId ?? null,
    cacheKey: cacheKey ?? null,
  });
}

export async function GET() {
  return NextResponse.json({
    service: "WikiFilms webhook receiver",
    note: "TMDB no ofrece webhooks nativos. Este endpoint es placeholder para integracion futura con proxies externos (Watcher, webhook.site, etc).",
    usage: "POST /api/webhook/tmdb con header x-webhook-secret y body { contentId, cacheKey?, action? }",
  });
}
