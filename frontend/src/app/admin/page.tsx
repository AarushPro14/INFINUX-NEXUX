import { redirect } from "next/navigation";
import { Building2, UserCheck, UserRoundPlus, BriefcaseBusiness } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isOwnerEmail } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { prisma } from "@/lib/prisma";
import AdminRequests from "@/components/admin-requests";
import ProfileMenu from "@/components/profile-menu";
import AdminStaffCredentials from "@/components/admin-staff-credentials";
import AdminDataSecurity from "@/components/admin-data-security";
import AdminRoleChanges from "@/components/admin-role-changes";
import WorkspaceBrand from "@/components/workspace-brand";
import PanelNavigation from "@/components/panel-navigation";
import AttendanceCalendar from "@/components/attendance-calendar";
export default async function AdminPage(){
 if(!(await hasEntryAccess()))redirect("/enter");
 const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/auth");
 const owner=await prisma.user.findUnique({where:{id:session.user.id},include:{company:true}});
 if(owner?.status==="SUSPENDED")redirect("/suspended");
 if(!owner||owner.role!=="OWNER"||!isOwnerEmail(owner.email)||owner.status!=="ACTIVE"||!owner.company)redirect("/continue");
 const [members,bosses,pending,roleChanges]=await Promise.all([
  prisma.user.count({where:{companyId:owner.company.id,role:"STAFF",status:"ACTIVE"}}),
  prisma.user.count({where:{companyId:owner.company.id,role:"OWNER",status:"ACTIVE"}}),
  prisma.accessRequest.count({where:{companyId:owner.company.id,status:"PENDING"}}),
  prisma.roleChangeRequest.count({where:{companyId:owner.company.id,status:"PENDING"}}),
 ]);
 const pendingTotal=pending+roleChanges;
 return <main className="app-shell"><div className="site-grid"/><header className="topbar"><WorkspaceBrand/><PanelNavigation role="OWNER"/><ProfileMenu name={owner.name} email={owner.email} image={owner.image}/></header><section className="page-container"><div className="page-kicker">OWNER ADMINISTRATION</div><h1 className="section-title">{owner.company.name}</h1><p className="section-copy">Manage workspace entry, staff credentials, join requests, and organization security.</p><div id="overview" className="dashboard-stats" style={{gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))"}}><div className="stat-card"><Building2 size={17} color="#efc377"/><strong style={{marginTop:15}}>{owner.company.name}</strong><span>BUSINESS WORKSPACE</span></div><div className="stat-card"><UserCheck size={17} color="#83dec2"/><strong>{members}</strong><span>ACTIVE STAFF</span></div><div className="stat-card"><BriefcaseBusiness size={17} color="#efc377"/><strong>{bosses}</strong><span>ACTIVE BOSSES</span></div><div className="stat-card"><UserRoundPlus size={17} color="#efc377"/><strong>{pendingTotal}</strong><span>PENDING REQUESTS</span></div></div><div id="attendance"><AttendanceCalendar role="OWNER"/></div><div id="staff"><AdminStaffCredentials/></div><div id="requests"><AdminRequests/><AdminRoleChanges/></div><div id="security"><AdminDataSecurity/></div></section></main>
}

