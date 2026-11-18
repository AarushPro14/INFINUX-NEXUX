import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export async function POST() {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true } });
  const canCancel = !!user && (
    (user.role === "STAFF" && user.status === "PENDING") ||
    ((user.role === "STAFF" || user.role === "OWNER") && user.status === "NEW")
  );
  if (!user || !canCancel) {
    return NextResponse.json({ error: "Only a new role selection or a pending join request can be cancelled here." }, { status: 409 });
  }
  if (user.role === "OWNER" && user.status === "NEW") {
    const approvedPromotion = await prisma.roleChangeRequest.findFirst({ where: { userId: session.user.id, status: "APPROVED" }, select: { id: true } });
    if (approvedPromotion) return NextResponse.json({ error: "Your Boss role change has been approved. Complete owner verification to continue." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.accessRequest.updateMany({
      where: { userId: session.user.id, status: "PENDING" },
      data: { status: "CANCELLED", reviewedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { role: "UNSELECTED", status: "NEW", companyId: null },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
