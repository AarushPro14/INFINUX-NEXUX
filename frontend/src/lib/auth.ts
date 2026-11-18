import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function isOwnerEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowlist = (process.env.OWNER_EMAILS ?? "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/auth" },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: { params: { prompt: "select_account" } },
    }),
    CredentialsProvider({
      name: "Email and password",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password || password.length > 128) return null;
        const fingerprint = createHash("sha256").update(`${process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "nexux"}:${email}`).digest("hex");
        const attempt = await prisma.loginAttempt.findUnique({ where: { fingerprint } });
        if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
          const reset = !attempt || Date.now() - attempt.updatedAt.getTime() > 15 * 60 * 1000;
          const failures = reset ? 1 : attempt.failures + 1;
          await prisma.loginAttempt.upsert({
            where: { fingerprint },
            create: { fingerprint, failures, blockedUntil: failures >= 10 ? new Date(Date.now() + 30 * 60 * 1000) : null },
            update: { failures, blockedUntil: failures >= 10 ? new Date(Date.now() + 30 * 60 * 1000) : null },
          });
          return null;
        }
        await prisma.loginAttempt.deleteMany({ where: { fingerprint } });
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (token.sub) {
        const current = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, status: true, companyId: true, name: true, email: true, image: true },
        });
        if (!current || current.status === "REMOVED") {
          token.role = "UNSELECTED";
          token.status = "REMOVED";
          token.companyId = null;
        } else {
          token.role = current.role;
          token.status = current.status;
          token.companyId = current.companyId;
          token.name = current.name;
          token.email = current.email;
          token.picture = current.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "UNSELECTED";
        session.user.status = (token.status as string) ?? "NEW";
        session.user.companyId = (token.companyId as string | null) ?? null;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};
