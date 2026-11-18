import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";
import { hasMailConfiguration, sendStaffAccessRequestEmail } from "@/lib/notifications";

export async function POST(request: Request) {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const body = await request.json();
  const requesterName = typeof body.name === "string" ? body.name.trim() : "";
  const requesterEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const contactNumber = typeof body.contactNumber === "string" ? body.contactNumber.trim() : "";
  const whatsappNumber = typeof body.whatsappNumber === "string" ? body.whatsappNumber.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const validPhone = (value: string) => /^\+?[0-9][0-9\s().-]{5,18}[0-9]$/.test(value);
  if (requesterName.length < 2 || requesterName.length > 100 || !validPhone(contactNumber) || !validPhone(whatsappNumber) || message.length > 1200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) return NextResponse.json({ error: "Enter a valid name, email, contact number, and WhatsApp number. Keep your message under 1,200 characters." }, { status: 400 });
  if (requesterEmail !== session.user.email?.toLowerCase()) return NextResponse.json({ error: "Use the email address on your signed-in account." }, { status: 403 });
  if (!hasMailConfiguration()) return NextResponse.json({ error: "EmailJS is not configured yet. Ask the workspace owner to finish the email setup." }, { status: 503 });
  const companyCode = process.env.NEXUX_COMPANY_ID ?? "@aarushiinfotech";
  const company = await prisma.company.findUnique({ where: { code: companyCode } });
  if (!company) return NextResponse.json({ error: "This NEXUX company is not set up yet. Ask its owner to complete company verification first." }, { status: 409 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, status: true, email: true } });
  if (!user || user.role !== "STAFF") return NextResponse.json({ error: "This account is not set up as staff." }, { status: 403 });
  if (user.status === "ACTIVE") return NextResponse.json({ error: "Your workspace access is already active." }, { status: 409 });
  if (user.status !== "NEW" && user.status !== "PENDING") return NextResponse.json({ error: "This account cannot request workspace access." }, { status: 409 });
  const existing = await prisma.accessRequest.findFirst({ where: { userId: session.user.id, companyId: company.id, status: "PENDING" } });
  if (user.status === "PENDING" && !existing) return NextResponse.json({ error: "Your current request is awaiting review." }, { status: 409 });
  let requestId = existing?.id;
  if (!existing) {
    const created = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: session.user.id }, data: { name: requesterName, companyId: company.id, status: "PENDING" } });
      return tx.accessRequest.create({ data: { userId: session.user.id, companyId: company.id, requesterName, requesterEmail, contactNumber, whatsappNumber, message } });
    });
    requestId = created.id;
  } else {
    await prisma.accessRequest.update({ where: { id: existing.id }, data: { requesterName, requesterEmail, contactNumber, whatsappNumber, message } });
  }
  try {
    await sendStaffAccessRequestEmail({ requestId: requestId!, requesterName, requesterEmail, contactNumber, whatsappNumber, companyName: company.name, companyCode, message });
    await prisma.accessRequest.update({ where: { id: requestId! }, data: { notificationSentAt: new Date() } });
  } catch {
    return NextResponse.json({ error: "Your request is saved, but the owner notification could not be delivered. Please contact the workspace owner." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, pending: true }, { status: existing ? 200 : 201 });
}
