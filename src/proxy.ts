import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getToken(request);

  if (pathname.startsWith("/admin")) {
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};