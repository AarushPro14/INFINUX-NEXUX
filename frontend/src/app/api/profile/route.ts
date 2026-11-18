import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

async function currentUser() {
  if (!(await hasEntryAccess())) return null;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: { select: { name: true } } },
  });
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in and verify the workspace key to view your profile." }, { status: 401 });
  return NextResponse.json({
    profile: {
      name: user.name ?? "",
      email: user.email,
      image: user.image,
      role: user.role,
      status: user.status,
      companyName: user.company?.name ?? null,
      joinedAt: user.createdAt,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in and verify the workspace key to update your profile." }, { status: 401 });
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 100) return NextResponse.json({ error: "Enter a name between 2 and 100 characters." }, { status: 400 });
  const updated = await prisma.user.update({ where: { id: user.id }, data: { name }, select: { name: true } });
  return NextResponse.json({ ok: true, name: updated.name });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in and verify the workspace key to upload a profile photo." }, { status: 401 });
  const configuredLimit = Number(process.env.PROFILE_IMAGE_MAX_BYTES ?? 41_943_040);
  const maxBytes = Number.isSafeInteger(configuredLimit) && configuredLimit > 0 ? Math.min(configuredLimit, 41_943_040) : 41_943_040;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes + 1024 * 1024) return NextResponse.json({ error: "Photo exceeds the 40 MiB limit." }, { status: 413 });
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "Photo exceeds the 40 MiB limit." }, { status: 413 });
  const mimeTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
  const extension = mimeTypes[file.type];
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, WebP, GIF, or AVIF image." }, { status: 415 });
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PROFILE_BUCKET || "profile-images";
  if (!baseUrl || !serviceKey) return NextResponse.json({ error: "Supabase Storage is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  const path = `${user.id}/avatar.${extension}`;
  const upload = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": file.type, "x-upsert": "true", "Cache-Control": "3600" },
    body: await file.arrayBuffer(),
  });
  if (!upload.ok) {
    const details = await upload.text();
    console.error("Supabase profile image upload failed:", upload.status, details);
    return NextResponse.json({ error: "Supabase could not save the image. Check that the profile-images bucket exists and allows uploads." }, { status: 502 });
  }
  const imageUrl = `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}?v=${Date.now()}`;
  await prisma.user.update({ where: { id: user.id }, data: { image: imageUrl } });
  return NextResponse.json({ ok: true, image: imageUrl });
}

