import { createHash, timingSafeEqual } from "node:crypto";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, role: true, status: true, companyId: true } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (body.action === "owner-reset") {
    if (user.role !== "OWNER" || user.status !== "ACTIVE" || !user.companyId) return NextResponse.json({ error: "Only an active Boss account can change its role here." }, { status: 403 });
    const expected = process.env.NEXUX_ENTRY_SECRET ?? "";
    const supplied = typeof body.entrySecret === "string" ? body.entrySecret : "";
    const remoteHeaders = await headers();
    const ip = remoteHeaders.get("x-real-ip") ?? remoteHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const fingerprint = createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex");
    const attempt = await prisma.gateAttempt.findUnique({ where: { fingerprint } });
    if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) return NextResponse.json({ error: "Access is temporarily locked. Try again later." }, { status: 429 });
    const expectedHash = createHash("sha256").update(expected).digest();
    const suppliedHash = createHash("sha256").update(supplied).digest();
    if (!expected || !timingSafeEqual(expectedHash, suppliedHash)) {
      const expired = !attempt || Date.now() - attempt.updatedAt.getTime() > 30 * 60 * 1000;
      const failures = expired ? 1 : attempt.failures + 1;
      await prisma.gateAttempt.upsert({
        where: { fingerprint },
        create: { fingerprint, failures, blockedUntil: failures >= 7 ? new Date(Date.now() + 30 * 60 * 1000) : null },
        update: { failures, blockedUntil: failures >= 7 ? new Date(Date.now() + 30 * 60 * 1000) : null },
      });
      return NextResponse.json({ error: failures >= 7 ? "Access is temporarily locked. Try again later." : "The workspace entry key was not accepted." }, { status: failures >= 7 ? 429 : 401 });
    }
    await prisma.gateAttempt.deleteMany({ where: { fingerprint } });
    await prisma.user.update({ where: { id: user.id }, data: { role: "UNSELECTED", status: "NEW", companyId: null } });
    return NextResponse.json({ ok: true, destination: "/choose-role" });
  }

  if (body.action !== "request-owner") return NextResponse.json({ error: "Invalid role change action." }, { status: 400 });
  if (user.role !== "STAFF" || user.status !== "ACTIVE" || !user.companyId) return NextResponse.json({ error: "Only active staff can request this role change." }, { status: 403 });
  const existing = await prisma.roleChangeRequest.findFirst({ where: { userId: user.id, status: "PENDING" }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "You already have a role change request awaiting review." }, { status: 409 });
  const requestRecord = await prisma.roleChangeRequest.create({ data: { userId: user.id, companyId: user.companyId } });
  return NextResponse.json({ ok: true, requestId: requestRecord.id }, { status: 201 });
}
