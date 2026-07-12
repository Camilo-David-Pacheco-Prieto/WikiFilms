export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/games/:path*", "/game/:path*"],
};
