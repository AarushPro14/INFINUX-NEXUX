import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encryptCredential } from "@/lib/credential-vault";

async function ownerContext() {
  if (!(await hasEntryAccess())) return null;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findFirst({ where: { id: session.user.id, role: "OWNER", status: "ACTIVE", companyId: { not: null } }, select: { id: true, companyId: true } });
}

export async function GET() {
  const owner = await ownerContext();
  if (!owner?.companyId) return NextResponse.json({ error: "Authorized owner access required." }, { status: 403 });
  const requests = await prisma.accessRequest.findMany({ where: { companyId: owner.companyId, status: "PENDING" }, include: { user: { select: { id: true, name: true, email: true, createdAt: true } } }, orderBy: { requestedAt: "asc" } });
  return NextResponse.json({ requests });
}

export async function PATCH(request: Request) {
  const owner = await ownerContext();
  if (!owner?.companyId) return NextResponse.json({ error: "Authorized owner access required." }, { status: 403 });
  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  const decision = body.decision;
  if (!id || (decision !== "approve" && decision !== "reject")) return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  const infxName = typeof body.infxName === "string" ? body.infxName.trim() : "";
  const staffId = typeof body.staffId === "string" ? body.staffId.trim().toUpperCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const privateCode = typeof body.privateCode === "string" ? body.privateCode : "";
  if (decision === "approve" && (infxName.length < 2 || infxName.length > 100 || !/^[A-Z0-9_-]{3,40}$/.test(staffId) || password.length < 10 || password.length > 128 || privateCode.length < 8 || privateCode.length > 128)) {
    return NextResponse.json({ error: "Assign an INFX name, a 3–40 character staff ID, a password (at least 10 characters), and a private code (at least 8 characters)." }, { status: 400 });
  }
  const item = await prisma.accessRequest.findFirst({ where: { id, companyId: owner.companyId, status: "PENDING" } });
  if (!item) return NextResponse.json({ error: "This request is no longer pending." }, { status: 404 });
  if (decision === "approve") {
    const duplicate = await prisma.staffCredential.findUnique({ where: { companyId_staffId: { companyId: owner.companyId, staffId } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "That staff ID is already in use. Choose another one." }, { status: 409 });
    await prisma.$transaction([
      prisma.staffCredential.create({ data: { companyId: owner.companyId, infxName, staffId, passwordHash: await bcrypt.hash(password, 12), privateCodeHash: await bcrypt.hash(privateCode, 12), passwordCiphertext: encryptCredential(password), privateCodeCiphertext: encryptCredential(privateCode), claimedByUserId: item.userId } }),
      prisma.accessRequest.update({ where: { id: item.id }, data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: owner.id } }),
      prisma.user.update({ where: { id: item.userId }, data: { name: infxName, role: "STAFF", status: "ACTIVE", companyId: owner.companyId } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.accessRequest.update({ where: { id: item.id }, data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: owner.id } }),
      prisma.user.update({ where: { id: item.userId }, data: { status: "NEW" } }),
    ]);
  }
  return NextResponse.json({ ok: true });
}
