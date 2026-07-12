import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Warning: in-memory Map does not persist across serverless instances.
// For production on Vercel, replace with Vercel KV or Upstash Redis rate limiting.
const rateLimit = new Map<string, { count: number; reset: number }>();
const MAX_REQUESTS = 40;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= MAX_REQUESTS;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    // Saltar rate limit para rutas internas de NextAuth (session, csrf, callback)
    if (pathname === "/api/auth/session" || pathname === "/api/auth/csrf" || pathname.startsWith("/api/auth/callback")) {
      return NextResponse.next();
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
  }

  const isSecure = request.nextUrl.protocol === "https:";

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie: isSecure });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/games") || pathname.startsWith("/game")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie: isSecure });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*", "/games/:path*", "/game/:path*"],
};
