import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entryCookieValue } from "@/lib/gate";

const MAX_FAILURES = 7;
const WINDOW_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  const configuredSecret = process.env.NEXUX_ENTRY_SECRET;
  if (!configuredSecret) return NextResponse.json({ error: "The entry gate is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    const remoteHeaders = await headers();
    const ip = remoteHeaders.get("x-real-ip") ?? remoteHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const fingerprint = createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex");
    const record = await prisma.gateAttempt.findUnique({ where: { fingerprint } });
    if (record?.blockedUntil && record.blockedUntil > new Date()) {
      return NextResponse.json({ error: "Access is temporarily locked. Try again later.", remaining: 0 }, { status: 429 });
    }
    const input = Buffer.from(password);
    const expected = Buffer.from(configuredSecret);
    const valid = input.length === expected.length && timingSafeEqual(input, expected);
    if (!valid) {
      const expired = !record || Date.now() - record.updatedAt.getTime() > WINDOW_MS;
      const failures = expired ? 1 : record.failures + 1;
      await prisma.gateAttempt.upsert({
        where: { fingerprint },
        create: { fingerprint, failures, blockedUntil: failures >= MAX_FAILURES ? new Date(Date.now() + WINDOW_MS) : null },
        update: { failures, blockedUntil: failures >= MAX_FAILURES ? new Date(Date.now() + WINDOW_MS) : null },
      });
      return NextResponse.json({ error: failures >= MAX_FAILURES ? "Access is temporarily locked. Try again later." : "That access key was not accepted.", remaining: Math.max(0, MAX_FAILURES - failures) }, { status: failures >= MAX_FAILURES ? 429 : 401 });
    }
    await prisma.gateAttempt.deleteMany({ where: { fingerprint } });
    const cookie = entryCookieValue();
    const response = NextResponse.json({ ok: true });
    response.cookies.set("nexux_gate", cookie.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: cookie.maxAge });
    return response;
  } catch (error) {
    console.error("Entry-key validation failed:", error);
    if (process.env.NODE_ENV !== "production" && error instanceof Error) {
      return NextResponse.json({ error: `Unable to validate entry: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: "Unable to validate entry right now." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("nexux_gate", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
