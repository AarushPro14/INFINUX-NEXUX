import { redirect } from "next/navigation";
import { Building2, ShieldCheck, UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";
import ProfileMenu from "@/components/profile-menu";
import StaffIssuedCredentials from "@/components/staff-issued-credentials";
import WorkspaceBrand from "@/components/workspace-brand";
import PanelNavigation from "@/components/panel-navigation";
import AttendanceCalendar from "@/components/attendance-calendar";
export default async function DashboardPage(){
 const user=await requireWorkspaceUser();
 if(user.role!=="STAFF")redirect("/continue");
 if(user.status!=="ACTIVE")redirect("/staff-request");
 const record=await prisma.user.findUnique({where:{id:user.id},include:{company:true}});
 if(!record?.company)redirect("/staff-request");
 const memberCount=await prisma.user.count({where:{companyId:record.companyId,role:"STAFF",status:"ACTIVE"}});
 return <main className="app-shell"><div className="site-grid"/><header className="topbar"><WorkspaceBrand/><PanelNavigation role="STAFF"/><ProfileMenu name={record.name} email={record.email} image={record.image}/></header><section className="page-container"><div className="page-kicker">STAFF WORKSPACE</div><h1 className="section-title">Good to have you, {record.name?.split(" ")[0]??"there"}.</h1><p className="section-copy">Your access is active for {record.company.name}. This workspace is ready for your team’s approved business operations.</p><div className="dashboard-stats"><div className="stat-card"><Building2 size={17} color="#83dce2"/><strong style={{marginTop:16,fontSize:17}}>{record.company.name}</strong><span>YOUR WORKSPACE</span></div><div className="stat-card"><UsersRound size={17} color="#83dce2"/><strong>{memberCount}</strong><span>ACTIVE TEAM MEMBERS</span></div><div className="stat-card"><ShieldCheck size={17} color="#83dec2"/><strong style={{fontSize:17,marginTop:2}}>Verified</strong><span>ACCOUNT ACCESS</span></div></div><AttendanceCalendar role="STAFF"/><div className="status-panel" style={{marginTop:24}}><strong>Workspace overview</strong><br/>Your access is approved. Business modules will appear here as they are enabled for your organization.</div><StaffIssuedCredentials/></section></main>
}

