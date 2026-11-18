import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in with Google first." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true, companyId: true } });
  if (!user || user.role !== "STAFF" || user.status !== "NEW") return NextResponse.json({ error: "Choose Staff before entering staff credentials." }, { status: 403 });

  const body = await request.json();
  const infxName = typeof body.infxName === "string" ? body.infxName.trim() : "";
  const staffId = typeof body.staffId === "string" ? body.staffId.trim().toUpperCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const privateCode = typeof body.privateCode === "string" ? body.privateCode : "";
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const fingerprint = createHash("sha256").update(`${process.env.AUTH_SECRET ?? "nexux"}:staff:${staffId.toLowerCase()}:${ip}`).digest("hex");
  const attempt = await prisma.loginAttempt.findUnique({ where: { fingerprint } });
  if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) return NextResponse.json({ error: "Staff sign-in is temporarily locked. Try again later." }, { status: 429 });

  const companyCode = process.env.NEXUX_COMPANY_ID;
  const company = companyCode ? await prisma.company.findUnique({ where: { code: companyCode }, select: { id: true } }) : null;
  const record = company && staffId ? await prisma.staffCredential.findUnique({ where: { companyId_staffId: { companyId: company.id, staffId } } }) : null;
  const credentialsMatch = Boolean(record && record.active && record.infxName.toLowerCase() === infxName.toLowerCase() && await bcrypt.compare(password, record.passwordHash) && await bcrypt.compare(privateCode, record.privateCodeHash) && (!record.claimedByUserId || record.claimedByUserId === session.user.id));
  if (!credentialsMatch || !record || !company) {
    const expired = !attempt || Date.now() - attempt.updatedAt.getTime() > 15 * 60 * 1000;
    const failures = expired ? 1 : attempt.failures + 1;
    await prisma.loginAttempt.upsert({ where: { fingerprint }, create: { fingerprint, failures, blockedUntil: failures >= 7 ? new Date(Date.now() + 30 * 60 * 1000) : null }, update: { failures, blockedUntil: failures >= 7 ? new Date(Date.now() + 30 * 60 * 1000) : null } });
    return NextResponse.json({ error: failures >= 7 ? "Staff sign-in is temporarily locked. Try again later." : "Those staff credentials were not accepted." }, { status: failures >= 7 ? 429 : 401 });
  }

  await prisma.$transaction(async tx => {
    const claimed = await tx.staffCredential.updateMany({ where: { id: record.id, active: true, OR: [{ claimedByUserId: null }, { claimedByUserId: session.user.id }] }, data: { claimedByUserId: session.user.id } });
    if (!claimed.count) throw new Error("Staff credential already linked.");
    await tx.user.update({ where: { id: session.user.id }, data: { name: record.infxName, companyId: company.id, status: "ACTIVE" } });
    await tx.loginAttempt.deleteMany({ where: { fingerprint } });
  });
  return NextResponse.json({ ok: true });
}
