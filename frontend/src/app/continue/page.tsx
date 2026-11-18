import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isOwnerEmail } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";

export default async function ContinuePage() {
  if (!(await hasEntryAccess())) redirect("/enter");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");
  // Always resolve routing from the authenticated database user. Never use
  // client session role data here: it can lag behind a Google account switch.
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, role: true, status: true } });
  if (!user) redirect("/auth?error=access");
  if (user.status === "REMOVED") redirect("/auth?error=access");
  if (user.status === "SUSPENDED") redirect("/suspended");
  if (user.role === "UNSELECTED") redirect("/choose-role");
  if (user.role === "OWNER") {
    if (!isOwnerEmail(user.email)) redirect("/choose-role");
    redirect(user.status === "ACTIVE" ? "/admin" : "/owner-verify");
  }
  if (user.role === "STAFF" && user.status === "NEW") redirect("/choose-role");
  if (user.status === "ACTIVE") redirect("/dashboard");
  if (user.status === "PENDING") redirect("/staff-request");
  redirect("/staff-login");
}
