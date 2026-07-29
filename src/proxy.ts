import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { strictRateLimit, writeRateLimit, readRateLimit } from "@/lib/rate-limit";

function getIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": "60" } },
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting ──────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Bypass: rutas internas de NextAuth, SSE y webhooks externos
    if (
      pathname === "/api/auth/session" ||
      pathname === "/api/auth/csrf" ||
      pathname.startsWith("/api/auth/callback") ||
      pathname === "/api/notifications/stream" ||
      pathname.startsWith("/api/webhook")
    ) {
      return NextResponse.next();
    }

    const ip = getIp(request);

    // Strict: registro y actualización de perfil
    if (pathname === "/api/auth/register" || pathname === "/api/auth/update") {
      const { success } = await strictRateLimit.limit(ip);
      if (!success) return rateLimitResponse();
    }
    // Write: mutaciones (POST, PATCH, DELETE)
    else if (request.method !== "GET") {
      const { success } = await writeRateLimit.limit(ip);
      if (!success) return rateLimitResponse();
    }
    // Read: consultas GET
    else {
      const { success } = await readRateLimit.limit(ip);
      if (!success) return rateLimitResponse();
    }
  }

  // ── Auth guard: admin ──────────────────────────────────
  const isSecure = request.nextUrl.protocol === "https:";
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie: isSecure });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Auth guard: games ──────────────────────────────────
  if (pathname.startsWith("/games") || pathname.startsWith("/game")) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie: isSecure });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/games/:path*", "/game/:path*"],
};
