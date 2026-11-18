import { redirect } from "next/navigation";
import { requireWorkspaceUser } from "@/lib/server-session";
import StaffCredentialsForm from "@/components/staff-credentials-form";
import ProfileMenu from "@/components/profile-menu";
import WorkspaceBrand from "@/components/workspace-brand";
export default async function StaffLoginPage() {
  const user = await requireWorkspaceUser();
  if (user.role !== "STAFF" || user.status !== "NEW") redirect("/continue");
  return <main className="app-shell"><div className="site-grid"/><header className="topbar"><WorkspaceBrand/><ProfileMenu name={user.name} email={user.email} image={user.image}/></header><section className="page-container"><div className="page-kicker">STAFF SIGN IN</div><h1 className="section-title">Verify your staff access</h1><p className="section-copy">Enter the INFX name, staff ID, password, and private code provided by your company Boss.</p><StaffCredentialsForm/></section></main>;
}

