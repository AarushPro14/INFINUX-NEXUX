import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";
import WorkPageClient from "@/components/work-page-client";

export default async function WorkPage() {
  const auth = await requireWorkspaceUser();
  if (auth.status !== "ACTIVE" || !auth.companyId) redirect("/continue");
  const [user, staff] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.id }, select: { id: true, name: true, email: true, image: true, role: true, companyId: true, company: { select: { name: true } } } }),
    prisma.user.findMany({ where: { companyId: auth.companyId, role: "STAFF", status: "ACTIVE" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  if (!user?.company) redirect("/continue");
  if (user.role === "STAFF") {
    const invited = await prisma.workSessionMember.findFirst({ where: { userId: user.id, session: { workspace: { companyId: user.companyId! } } } });
    if (!invited) redirect("/dashboard");
  }
  return <WorkPageClient user={{ id: user.id, name: user.name ?? "Team member", email: user.email, image: user.image, role: user.role }} company={user.company.name} staff={staff.map(s => ({ id: s.id, name: s.name ?? s.email, email: s.email }))} />;
}
