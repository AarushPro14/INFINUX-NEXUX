import { redirect } from "next/navigation";
import { CalendarDays, Building2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { requireWorkspaceUser } from "@/lib/server-session";
import { prisma } from "@/lib/prisma";
import ProfileMenu from "@/components/profile-menu";
import ProfileSettingsForm from "@/components/profile-settings-form";
import RoleAccessControls from "@/components/role-access-controls";
import CompanySettingsForm from "@/components/company-settings-form";
import WorkspaceBrand from "@/components/workspace-brand";
export default async function ProfilePage() {
  const sessionUser = await requireWorkspaceUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, include: { company: { select: { name: true } } } });
  if (!user) redirect("/auth");
  const pendingRoleRequest = user.role === "STAFF" ? await prisma.roleChangeRequest.findFirst({ where: { userId: user.id, status: "PENDING" }, select: { id: true } }) : null;
  return <main className="app-shell"><div className="site-grid"/><header className="topbar"><WorkspaceBrand/><ProfileMenu name={user.name} email={user.email} image={user.image}/></header><section className="page-container"><Link href="/continue" className="back-link" style={{display:"inline-flex",marginBottom:22}}>← Back to workspace</Link><div className="page-kicker">PROFILE SETTINGS</div><h1 className="section-title">Your profile</h1><p className="section-copy">Manage your name and profile photo. Your email is managed by the sign-in provider.</p><div className="profile-details"><div><Mail size={16}/><span>Email</span><strong>{user.email}</strong></div><div><ShieldCheck size={16}/><span>Access</span><strong>{user.role.toLowerCase()} · {user.status.toLowerCase()}</strong></div><div><Building2 size={16}/><span>Company</span><strong>{user.company?.name ?? "Not connected"}</strong></div><div><CalendarDays size={16}/><span>Joined</span><strong>{user.createdAt.toLocaleDateString()}</strong></div></div><ProfileSettingsForm initialName={user.name ?? ""} initialImage={user.image ?? ""}/>{user.role === "OWNER" && user.status === "ACTIVE" && user.company && <CompanySettingsForm companyName={user.company.name}/>}<RoleAccessControls role={user.role} status={user.status} hasPendingRequest={!!pendingRoleRequest}/></section></main>;
}
