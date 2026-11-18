import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";

export async function GET() {
  const auth = await requireWorkspaceUser();
  const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { id: true, status: true, companyId: true } });
  if (!user || user.status !== "ACTIVE" || !user.companyId) return NextResponse.json({ error: "Active workspace access required." }, { status: 403 });
  const setting = await prisma.workQuickReply.findUnique({ where: { userId: user.id }, select: { replies: true } });
  return NextResponse.json({ replies: setting?.replies ?? [] });
}

export async function PUT(request: Request) {
  const auth = await requireWorkspaceUser();
  const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { id: true, status: true, companyId: true } });
  if (!user || user.status !== "ACTIVE" || !user.companyId) return NextResponse.json({ error: "Active workspace access required." }, { status: 403 });
  let body: { replies?: unknown }; try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!Array.isArray(body.replies) || body.replies.length > 8 || body.replies.some(item => typeof item !== "string" || item.length > 300)) return NextResponse.json({ error: "Quick replies must contain up to 8 short messages." }, { status: 400 });
  const replies = body.replies.map(item => (item as string).trim()).filter(Boolean);
  await prisma.workQuickReply.upsert({ where: { userId: user.id }, create: { userId: user.id, replies }, update: { replies } });
  return NextResponse.json({ replies });
}
