import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true, companyId: true } });
  if (!user || user.role !== "OWNER" || user.status !== "ACTIVE" || !user.companyId) return NextResponse.json({ error: "Only an active Boss can edit company details." }, { status: 403 });
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 120) return NextResponse.json({ error: "Company name must be 2–120 characters." }, { status: 400 });
  try {
    const company = await prisma.company.update({ where: { id: user.companyId }, data: { name }, select: { name: true } });
    return NextResponse.json({ ok: true, companyName: company.name });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That company name is already in use." }, { status: 409 });
    throw error;
  }
}
