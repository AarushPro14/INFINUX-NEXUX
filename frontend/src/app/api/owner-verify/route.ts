import { getServerSession } from "next-auth";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true, email: true } });
  const trustedOwners = (process.env.OWNER_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!user || user.role !== "OWNER" || !trustedOwners.includes(user.email.toLowerCase())) return NextResponse.json({ error: "This account is not authorized for owner verification." }, { status: 403 });
  if (user.status !== "NEW") return NextResponse.json({ error: "This owner account cannot be verified again." }, { status: 409 });
  const expectedCompanyId = process.env.NEXUX_COMPANY_ID;
  const expectedPassword = process.env.NEXUX_COMPANY_PASSWORD;
  if (!expectedCompanyId || !expectedPassword || expectedPassword.length < 12) return NextResponse.json({ error: "Set a NEXUX company password with at least 12 characters in the server environment." }, { status: 503 });
  const body = await request.json();
  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const companyId = typeof body.companyId === "string" ? body.companyId.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (companyName.length < 2 || companyName.length > 120) return NextResponse.json({ error: "Enter your registered business name." }, { status: 400 });
  const fingerprint = createHash("sha256").update(`${process.env.AUTH_SECRET ?? "nexux"}:owner-verify:${user.email.toLowerCase()}`).digest("hex");
  const attempt = await prisma.loginAttempt.findUnique({ where: { fingerprint } });
  if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) return NextResponse.json({ error: "Verification is temporarily locked. Try again later." }, { status: 429 });
  const inputId = Buffer.from(companyId);
  const expectedId = Buffer.from(expectedCompanyId);
  const inputPassword = Buffer.from(password);
  const expectedPasswordBuffer = Buffer.from(expectedPassword);
  const validId = inputId.length === expectedId.length && timingSafeEqual(inputId, expectedId);
  const validPassword = inputPassword.length === expectedPasswordBuffer.length && timingSafeEqual(inputPassword, expectedPasswordBuffer);
  if (!validId || !validPassword) {
    const expired = !attempt || Date.now() - attempt.updatedAt.getTime() > 15 * 60 * 1000;
    const failures = expired ? 1 : attempt.failures + 1;
    await prisma.loginAttempt.upsert({
      where: { fingerprint },
      create: { fingerprint, failures, blockedUntil: failures >= 7 ? new Date(Date.now() + 30 * 60 * 1000) : null },
      update: { failures, blockedUntil: failures >= 7 ? new Date(Date.now() + 30 * 60 * 1000) : null },
    });
    return NextResponse.json({ error: failures >= 7 ? "Verification is temporarily locked. Try again later." : "The company ID or password was not accepted.", remaining: Math.max(0, 7 - failures) }, { status: failures >= 7 ? 429 : 401 });
  }
  await prisma.loginAttempt.deleteMany({ where: { fingerprint } });
  let company = await prisma.company.findUnique({ where: { code: expectedCompanyId } });
  if (!company) {
    company = await prisma.company.findUnique({ where: { name: companyName } });
    if (company) company = await prisma.company.update({ where: { id: company.id }, data: { code: expectedCompanyId } });
    else company = await prisma.company.create({ data: { name: companyName, code: expectedCompanyId } });
  }
  if (company.name !== companyName) return NextResponse.json({ error: "That company ID is already linked to a different business name." }, { status: 409 });
  await prisma.user.update({ where: { id: session.user.id }, data: { companyId: company.id, status: "ACTIVE" } });
  return NextResponse.json({ ok: true });
}
