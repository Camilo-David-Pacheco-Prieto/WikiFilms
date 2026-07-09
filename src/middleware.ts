import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const COOKIE_NAME = "next-auth.session-token";

async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { username?: string; role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (pathname.startsWith("/admin")) {
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};