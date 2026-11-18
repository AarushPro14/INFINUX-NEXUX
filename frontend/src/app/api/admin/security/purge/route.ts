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
  const owner = await prisma.user.findFirst({ where: { id: session.user.id, role: "OWNER", status: "ACTIVE", companyId: { not: null } }, select: { id: true, companyId: true } });
  if (!owner) return NextResponse.json({ error: "Authorized Boss access required." }, { status: 403 });

  const body = await request.json();
  const supplied = typeof body.entrySecret === "string" ? body.entrySecret : "";
  const expected = process.env.NEXUX_ENTRY_SECRET ?? "";
  const suppliedHash = createHash("sha256").update(supplied).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  if (!expected || !timingSafeEqual(suppliedHash, expectedHash)) return NextResponse.json({ error: "The workspace entry secret was not accepted." }, { status: 401 });
  if (body.confirmation !== "DELETE STAFF DATA") return NextResponse.json({ error: "Type DELETE STAFF DATA to confirm." }, { status: 400 });

  const removed = await prisma.$transaction(async tx => {
    const roleChangeRequests = await tx.roleChangeRequest.deleteMany({ where: { companyId: owner.companyId! } });
    const requests = await tx.accessRequest.deleteMany({ where: { companyId: owner.companyId! } });
    const credentials = await tx.staffCredential.deleteMany({ where: { companyId: owner.companyId! } });
    const staff = await tx.user.deleteMany({ where: { role: "STAFF", companyId: owner.companyId } });
    return { staffAccounts: staff.count, staffCredentials: credentials.count, staffRequests: requests.count, roleChangeRequests: roleChangeRequests.count };
  });
  return NextResponse.json({ ok: true, removed });
}
