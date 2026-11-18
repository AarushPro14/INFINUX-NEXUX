import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/credential-vault";

async function ownerCompanyId() {
  if (!(await hasEntryAccess())) return null;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const owner = await prisma.user.findFirst({
    where: { id: session.user.id, role: "OWNER", status: "ACTIVE", companyId: { not: null } },
    select: { companyId: true },
  });
  return owner?.companyId ?? null;
}

export async function GET() {
  const companyId = await ownerCompanyId();
  if (!companyId) return NextResponse.json({ error: "Authorized owner access required." }, { status: 403 });
  const staff = await prisma.staffCredential.findMany({
    where: { companyId },
    select: { id: true, infxName: true, staffId: true, active: true, claimedByUserId: true, createdAt: true, claimedByUser: { select: { name: true, email: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  const companyId = await ownerCompanyId();
  if (!companyId) return NextResponse.json({ error: "Authorized owner access required." }, { status: 403 });
  const body = await request.json();
  const infxName = typeof body.infxName === "string" ? body.infxName.trim() : "";
  const staffId = typeof body.staffId === "string" ? body.staffId.trim().toUpperCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const privateCode = typeof body.privateCode === "string" ? body.privateCode : "";
  if (infxName.length < 2 || infxName.length > 100 || !/^[A-Z0-9_-]{3,40}$/.test(staffId) || password.length < 10 || password.length > 128 || privateCode.length < 8 || privateCode.length > 128) {
    return NextResponse.json({ error: "Enter a staff name, an ID of 3–40 letters/numbers, a password of at least 10 characters, and a private code of at least 8 characters." }, { status: 400 });
  }
  const exists = await prisma.staffCredential.findUnique({ where: { companyId_staffId: { companyId, staffId } }, select: { id: true } });
  if (exists) return NextResponse.json({ error: "That staff ID already exists in this company." }, { status: 409 });
  await prisma.staffCredential.create({
    data: { companyId, infxName, staffId, passwordHash: await bcrypt.hash(password, 12), privateCodeHash: await bcrypt.hash(privateCode, 12), passwordCiphertext: encryptCredential(password), privateCodeCiphertext: encryptCredential(privateCode) },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const companyId = await ownerCompanyId();
  if (!companyId) return NextResponse.json({ error: "Authorized owner access required." }, { status: 403 });
  const body = await request.json();
  if (typeof body.id !== "string") return NextResponse.json({ error: "Invalid staff update." }, { status: 400 });
  if (body.action === "edit") {
    const infxName = typeof body.infxName === "string" ? body.infxName.trim() : "";
    const staffId = typeof body.staffId === "string" ? body.staffId.trim().toUpperCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const privateCode = typeof body.privateCode === "string" ? body.privateCode : "";
    if (infxName.length < 2 || infxName.length > 100 || !/^[A-Z0-9_-]{3,40}$/.test(staffId) || password.length < 10 || password.length > 128 || privateCode.length < 8 || privateCode.length > 128) return NextResponse.json({ error: "Enter valid staff details and credentials." }, { status: 400 });
    const duplicate = await prisma.staffCredential.findFirst({ where: { companyId, staffId, id: { not: body.id } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "That staff ID is already in use." }, { status: 409 });
    const result = await prisma.staffCredential.updateMany({ where: { id: body.id, companyId }, data: { infxName, staffId, passwordHash: await bcrypt.hash(password, 12), privateCodeHash: await bcrypt.hash(privateCode, 12), passwordCiphertext: encryptCredential(password), privateCodeCiphertext: encryptCredential(privateCode) } });
    if (!result.count) return NextResponse.json({ error: "Staff record not found." }, { status: 404 });
    const credential = await prisma.staffCredential.findUnique({ where: { id: body.id }, select: { claimedByUserId: true } });
    if (credential?.claimedByUserId) await prisma.user.update({ where: { id: credential.claimedByUserId }, data: { name: infxName } });
    return NextResponse.json({ ok: true });
  }
  if (typeof body.active !== "boolean") return NextResponse.json({ error: "Invalid staff update." }, { status: 400 });
  const record = await prisma.staffCredential.findFirst({ where: { id: body.id, companyId }, select: { id: true, claimedByUserId: true } });
  if (!record) return NextResponse.json({ error: "Staff record not found." }, { status: 404 });
  await prisma.$transaction([
    prisma.staffCredential.update({ where: { id: record.id }, data: { active: body.active } }),
    ...(record.claimedByUserId ? [prisma.user.update({ where: { id: record.claimedByUserId }, data: { status: body.active ? "ACTIVE" : "SUSPENDED" } })] : []),
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const companyId = await ownerCompanyId();
  if (!companyId) return NextResponse.json({ error: "Authorized owner access required." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Staff record ID is required." }, { status: 400 });
  const record = await prisma.staffCredential.findFirst({ where: { id, companyId }, select: { id: true, claimedByUserId: true } });
  if (!record) return NextResponse.json({ error: "Staff record not found." }, { status: 404 });
  await prisma.$transaction([
    prisma.staffCredential.delete({ where: { id: record.id } }),
    ...(record.claimedByUserId ? [prisma.user.update({ where: { id: record.claimedByUserId }, data: { role: "UNSELECTED", status: "NEW", companyId: null } })] : []),
  ]);
  return NextResponse.json({ ok: true });
}
