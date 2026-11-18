import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isOwnerEmail } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { role } = await request.json();
  if (role !== "STAFF" && role !== "OWNER") return NextResponse.json({ error: "Choose a valid workspace role." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true, companyId: true, email: true } });
  if (!user) return NextResponse.json({ error: "Your account could not be found." }, { status: 404 });
  const hasPendingRequest = await prisma.accessRequest.findFirst({ where: { userId: session.user.id, status: "PENDING" }, select: { id: true } });
  if (user.status !== "NEW" || user.companyId || hasPendingRequest) {
    return NextResponse.json({ error: "Your role cannot be changed after workspace access or a join request has started." }, { status: 409 });
  }
  if (role === "OWNER") {
    if (!isOwnerEmail(user.email)) return NextResponse.json({ error: "Boss access is limited to authorized owner email addresses." }, { status: 403 });
  }
  await prisma.user.update({ where: { id: session.user.id }, data: { role, status: "NEW" } });
  return NextResponse.json({ ok: true });
}
