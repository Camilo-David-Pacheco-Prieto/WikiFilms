import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    role: "USER" | "ADMIN";
    avatarUrl?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      role: "USER" | "ADMIN";
      avatarUrl?: string | null;
    };
  }
}

const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).username = user.username;
        (token as any).role = user.role;
        const raw = user.avatarUrl;
        (token as any).avatarUrl =
          raw && !raw.startsWith("/api/blob")
            ? `/api/blob?pathname=${encodeURIComponent(raw)}`
            : raw;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      (session.user as any).username = (token as any).username;
      (session.user as any).role = (token as any).role;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { avatarUrl: true },
        });
        const raw = dbUser?.avatarUrl;
        (session.user as any).avatarUrl =
          raw && !raw.startsWith("/api/blob")
            ? `/api/blob?pathname=${encodeURIComponent(raw)}`
            : raw;
      } catch {
        (session.user as any).avatarUrl = (token as any).avatarUrl;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);