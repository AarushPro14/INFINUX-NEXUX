import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";

export async function POST(request: Request) {
  const auth = await requireWorkspaceUser();
  const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { id: true, role: true, status: true, companyId: true } });
  if (!user || user.status !== "ACTIVE" || !user.companyId) return NextResponse.json({ error: "Active workspace access required." }, { status: 403 });
  let body: { sessionId?: unknown; name?: unknown; mimeType?: unknown; size?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid upload request." }, { status: 400 }); }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const name = typeof body.name === "string" ? body.name : "";
  const mimeType = typeof body.mimeType === "string" && body.mimeType ? body.mimeType : "application/octet-stream";
  const size = typeof body.size === "number" ? body.size : 0;
  if (!name || name.length > 240 || !Number.isSafeInteger(size) || size <= 0) return NextResponse.json({ error: "Choose a named file with a valid size." }, { status: 400 });
  const session = await prisma.workSession.findFirst({ where: { id: sessionId, workspace: { companyId: user.companyId }, ...(user.role === "OWNER" ? {} : { members: { some: { userId: user.id } } }) }, select: { id: true } });
  if (!session) return NextResponse.json({ error: "Session not found or you are not invited." }, { status: 404 });
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.WORK_ATTACHMENTS_BUCKET || "work-attachments";
  if (!baseUrl || !serviceKey) return NextResponse.json({ error: "Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  const safeName = name.replace(/[\\/\0-\x1f]/g, "_").slice(0, 180) || "attachment";
  const path = `${user.companyId}/${session.id}/${randomUUID()}-${safeName}`;
  const create = await fetch(`${baseUrl}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST", headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" }, body: JSON.stringify({ upsert: false }),
  });
  if (!create.ok) {
    const detail = await create.text();
    console.error("Could not create signed work upload:", create.status, detail);
    return NextResponse.json({ error: "Supabase could not prepare this upload. Check the work attachments bucket." }, { status: 502 });
  }
  const result = await create.json() as { token?: string };
  if (!result.token) return NextResponse.json({ error: "Supabase returned an invalid upload token." }, { status: 502 });
  const uploadUrl = `${baseUrl}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}?token=${encodeURIComponent(result.token)}`;
  return NextResponse.json({ uploadUrl, path, name: safeName, mimeType, size }, { status: 201 });
}
