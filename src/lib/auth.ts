import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    role: "USER" | "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      role: "USER" | "ADMIN";
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).username = user.username;
        (token as any).role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      (session.user as any).username = (token as any).username;
      (session.user as any).role = (token as any).role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);