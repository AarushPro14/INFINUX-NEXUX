import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { hasMailConfiguration, sendStaffAccessRequestEmail } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST() {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  if (!hasMailConfiguration()) return NextResponse.json({ error: "EmailJS is not configured yet." }, { status: 503 });
  const request = await prisma.accessRequest.findFirst({ where: { userId: session.user.id, status: "PENDING" }, include: { company: true }, orderBy: { requestedAt: "desc" } });
  if (!request) return NextResponse.json({ error: "No pending staff request was found." }, { status: 404 });
  if (request.notificationSentAt) return NextResponse.json({ ok: true, alreadySent: true });
  try {
    await sendStaffAccessRequestEmail({
      requestId: request.id,
      requesterName: request.requesterName ?? session.user.name ?? "Staff member",
      requesterEmail: request.requesterEmail ?? session.user.email ?? "",
      contactNumber: request.contactNumber ?? "",
      whatsappNumber: request.whatsappNumber ?? "",
      companyName: request.company.name,
      companyCode: request.company.code ?? process.env.NEXUX_COMPANY_ID ?? "",
      message: request.message ?? "",
    });
    await prisma.accessRequest.update({ where: { id: request.id }, data: { notificationSentAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The owner notification could not be delivered. Check the EmailJS service, template, and account settings, then try again." }, { status: 502 });
  }
}
