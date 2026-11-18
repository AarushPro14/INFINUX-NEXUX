import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

async function ownerContext() {
  if (!(await hasEntryAccess())) return null;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findFirst({ where: { id: session.user.id, role: "OWNER", status: "ACTIVE", companyId: { not: null } }, select: { id: true, companyId: true } });
}

export async function GET() {
  const owner = await ownerContext();
  if (!owner?.companyId) return NextResponse.json({ error: "Authorized Boss access required." }, { status: 403 });
  const requests = await prisma.roleChangeRequest.findMany({
    where: { companyId: owner.companyId, status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { requestedAt: "asc" },
  });
  return NextResponse.json({ requests });
}

export async function PATCH(request: Request) {
  const owner = await ownerContext();
  if (!owner?.companyId) return NextResponse.json({ error: "Authorized Boss access required." }, { status: 403 });
  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  const decision = body.decision;
  if (!id || (decision !== "approve" && decision !== "reject")) return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  const pending = await prisma.roleChangeRequest.findFirst({ where: { id, companyId: owner.companyId, status: "PENDING" }, include: { user: { select: { id: true, email: true, role: true, status: true } } } });
  if (!pending) return NextResponse.json({ error: "This role change request is no longer pending." }, { status: 404 });

  if (decision === "approve") {
    const allowlist = (process.env.OWNER_EMAILS ?? "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
    if (!allowlist.includes(pending.user.email.toLowerCase())) return NextResponse.json({ error: "This account is not in the Boss allowlist. Add its email to OWNER_EMAILS before approving." }, { status: 403 });
    if (pending.user.role !== "STAFF" || pending.user.status !== "ACTIVE") return NextResponse.json({ error: "This account is no longer active staff." }, { status: 409 });
    await prisma.$transaction(async tx => {
      await tx.staffCredential.deleteMany({ where: { claimedByUserId: pending.user.id } });
      await tx.user.update({ where: { id: pending.user.id }, data: { role: "OWNER", status: "NEW", companyId: null } });
      await tx.roleChangeRequest.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: owner.id } });
    });
  } else {
    await prisma.roleChangeRequest.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: owner.id } });
  }
  return NextResponse.json({ ok: true });
}
