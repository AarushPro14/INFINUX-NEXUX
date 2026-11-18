import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const fingerprint = createHash("sha256").update(`${process.env.AUTH_SECRET ?? "nexux"}:register:${ip}`).digest("hex");
    const attempt = await prisma.loginAttempt.findUnique({ where: { fingerprint } });
    if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) return NextResponse.json({ error: "Too many sign-up attempts. Try again later." }, { status: 429 });
    const expired = !attempt || Date.now() - attempt.updatedAt.getTime() > 15 * 60 * 1000;
    const failures = expired ? 1 : attempt.failures + 1;
    await prisma.loginAttempt.upsert({
      where: { fingerprint },
      create: { fingerprint, failures, blockedUntil: failures >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null },
      update: { failures, blockedUntil: failures >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null },
    });
    if (failures >= 5) return NextResponse.json({ error: "Too many sign-up attempts. Try again later." }, { status: 429 });
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: "Enter your name, a valid email, and a password with at least 12 characters." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
    if (existing) return NextResponse.json({ error: existing.passwordHash ? "An account already exists for this email." : "Use Google sign-in for this account." }, { status: 409 });
    await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
