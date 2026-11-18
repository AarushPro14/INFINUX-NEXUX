import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";

async function activeUser() {
  const session = await requireWorkspaceUser();
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, role: true, status: true, companyId: true } });
  if (!user || user.status !== "ACTIVE" || !user.companyId) return null;
  return user;
}
function fail(error: string, status = 400) { return NextResponse.json({ error }, { status }); }

export async function GET() {
  const user = await activeUser();
  if (!user) return fail("Active workspace access required.", 403);
  const workspaces = await prisma.workWorkspace.findMany({ where: { companyId: user.companyId! }, include: { sessions: { where: user.role === "OWNER" ? {} : { members: { some: { userId: user.id } } }, include: { members: { include: { user: { select: { id: true, name: true } } } }, messages: { orderBy: { createdAt: "desc" }, take: 50 } }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "asc" } });
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.WORK_ATTACHMENTS_BUCKET || "work-attachments";
  const signedBody = async (body: string) => {
    try {
      const metadata = JSON.parse(body) as { path?: string; name?: string; mimeType?: string; size?: number; url?: string };
      if (!metadata.path || !baseUrl || !serviceKey) return body;
      const response = await fetch(`${baseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${metadata.path.split("/").map(encodeURIComponent).join("/")}`, {
        method: "POST", headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }),
      });
      if (!response.ok) return JSON.stringify({ ...metadata, url: null });
      const result = await response.json() as { signedURL?: string };
      const path = result.signedURL ?? "";
      return JSON.stringify({ ...metadata, url: path.startsWith("http") ? path : `${baseUrl}/storage/v1${path.startsWith("/") ? path : `/${path}`}` });
    } catch { return body; }
  };
  const result = await Promise.all(workspaces.map(async workspace => {
    const sessions = await Promise.all(workspace.sessions.map(async session => {
      const messages = await Promise.all([...session.messages].reverse().map(async message => ({
        id: message.id,
        authorId: message.authorId,
        authorName: message.authorName,
        body: message.kind === "FILE" || message.kind === "AUDIO" ? await signedBody(message.body) : message.body,
        kind: message.kind,
        createdAt: message.createdAt,
      })));
      return { id: session.id, name: session.name, members: session.members.map(member => ({ id: member.user.id, name: member.user.name })), messages };
    }));
    return { id: workspace.id, name: workspace.name, key: workspace.workspaceKey, sessions };
  }));
  return NextResponse.json({ workspaces: result });
}

export async function POST(request: Request) {
  const user = await activeUser();
  if (!user || user.role !== "OWNER") return fail("Only the Boss can create workspaces.", 403);
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return fail("Invalid request."); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const key = typeof body.key === "string" ? body.key.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (name.length < 2 || name.length > 100 || !/^[a-zA-Z0-9_-]{3,40}$/.test(key) || password.length < 8 || password.length > 128) return fail("Enter a workspace name, an ID with 3–40 letters or numbers, and a password with at least 8 characters.");
  try { const workspace = await prisma.workWorkspace.create({ data: { name, workspaceKey: key, passwordHash: await bcrypt.hash(password, 12), companyId: user.companyId! } }); return NextResponse.json({ workspace: { id: workspace.id, name, key, sessions: [] } }, { status: 201 }); } catch { return fail("That workspace ID is already in use.", 409); }
}

export async function PATCH(request: Request) {
  const user = await activeUser();
  if (!user || user.role !== "OWNER") return fail("Only the Boss can create sessions.", 403);
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return fail("Invalid request."); }
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const raw = Array.isArray(body.staffIds) ? body.staffIds.filter((id): id is string => typeof id === "string") : [];
  if (name.length < 2 || name.length > 100) return fail("Session name must have 2–100 characters.");
  const workspace = await prisma.workWorkspace.findFirst({ where: { id: workspaceId, companyId: user.companyId! }, select: { id: true } });
  if (!workspace) return fail("Workspace not found.", 404);
  const eligible = await prisma.user.findMany({ where: { id: { in: raw }, companyId: user.companyId!, role: "STAFF", status: "ACTIVE" }, select: { id: true } });
  const staff = raw.length ? eligible : await prisma.user.findMany({ where: { companyId: user.companyId!, role: "STAFF", status: "ACTIVE" }, select: { id: true } });
  const session = await prisma.workSession.create({ data: { name, workspaceId, members: { create: [{ userId: user.id }, ...staff.map(s => ({ userId: s.id }))] } }, include: { members: { include: { user: { select: { id: true, name: true } } } } } });
  return NextResponse.json({ session: { id: session.id, name, members: session.members.map(m => ({ id: m.user.id, name: m.user.name })), messages: [] } }, { status: 201 });
}

export async function PUT(request: Request) {
  const user = await activeUser();
  if (!user) return fail("Active workspace access required.", 403);
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return fail("Invalid request."); }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const kind = typeof body.kind === "string" && ["TEXT", "LINK", "LOCATION", "FILE", "AUDIO", "ACTION"].includes(body.kind) ? body.kind : "TEXT";
  const session = await prisma.workSession.findFirst({ where: { id: sessionId, workspace: { companyId: user.companyId! }, ...(user.role === "OWNER" ? {} : { members: { some: { userId: user.id } } }) }, select: { id: true } });
  if (!session) return fail("Session not found or you are not invited.", 404);
  if (!text || text.length > 50000) return fail("Message must contain 1–50,000 characters.");
  if ((kind === "FILE" || kind === "AUDIO") && (() => { try { const item = JSON.parse(text) as { path?: string }; return !item.path || !item.path.startsWith(`${user.companyId}/${sessionId}/`); } catch { return true; } })()) return fail("Upload an attachment to this session before sharing it.");
  const message = await prisma.workMessage.create({ data: { sessionId, authorId: user.id, authorName: user.name ?? "Team member", body: text, kind } });
  return NextResponse.json({ message }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await activeUser();
  if (!user || user.role !== "OWNER") return fail("Only the Boss can delete sessions.", 403);
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return fail("Invalid request."); }
  if (body.confirmation !== "DELETE") return fail("Type DELETE to confirm.");
  const result = await prisma.workSession.deleteMany({ where: { id: typeof body.sessionId === "string" ? body.sessionId : "", workspace: { companyId: user.companyId! } } });
  if (!result.count) return fail("Session not found.", 404);
  return NextResponse.json({ ok: true });
}
