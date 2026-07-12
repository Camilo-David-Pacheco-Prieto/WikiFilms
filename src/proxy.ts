import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

// Warning: in-memory Map does not persist across serverless instances.
// For production on Vercel, replace with Vercel KV or Upstash Redis rate limiting.
const rateLimit = new Map<string, { count: number; reset: number }>();
const MAX_REQUESTS = 40;
const WINDOW_MS = 60_000;

function getToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get("__Secure-next-auth.session-token")?.value ??
    request.cookies.get("next-auth.session-token")?.value
  );
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { username?: string; role?: string };
  } catch {
    return null;
  }
}

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

  if (pathname.startsWith("/admin")) {
    const token = getToken(request);
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/games") || pathname.startsWith("/game")) {
    const token = getToken(request);
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*", "/games/:path*", "/game/:path*"],
};
