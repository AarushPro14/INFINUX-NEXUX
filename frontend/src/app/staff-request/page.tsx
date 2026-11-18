import { redirect } from "next/navigation";
import { Clock3, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";
import StaffRequestForm from "@/components/staff-request-form";
import ProfileMenu from "@/components/profile-menu";
import RetryRequestNotification from "@/components/retry-request-notification";
import CancelJoinRequest from "@/components/cancel-join-request";
import WorkspaceBrand from "@/components/workspace-brand";
export default async function StaffRequestPage(){
 const user=await requireWorkspaceUser();
 if(user.role!=="STAFF")redirect("/continue");
 if(user.status==="ACTIVE")redirect("/dashboard");
 if(user.status!=="NEW"&&user.status!=="PENDING")redirect("/continue");
 const latest=await prisma.accessRequest.findFirst({where:{userId:user.id},include:{company:true},orderBy:{requestedAt:"desc"}});
 return <main className="app-shell"><div className="site-grid"/><header className="topbar"><WorkspaceBrand/><ProfileMenu name={user.name} email={user.email} image={user.image}/></header><section className="page-container"><div className="page-kicker">STAFF WORKSPACE</div><h1 className="section-title">{user.status==="PENDING"?"Request received":"Request access"}</h1><p className="section-copy">Send your request to the NEXUX business owner. Your workspace stays limited until they approve it.</p>{user.status==="PENDING"?<><div className="status-panel"><strong><Clock3 size={16} style={{verticalAlign:"-3px",marginRight:8,color:"#f0c878"}}/>Approval pending</strong><br/>Your request to join <strong>{latest?.company.name??"your company"}</strong> is waiting for an owner to review. The owner notification includes your contact details and message.</div>{latest&&!latest.notificationSentAt&&<RetryRequestNotification/>}<CancelJoinRequest/></>:<><div className="status-panel"><strong><ShieldCheck size={16} style={{verticalAlign:"-3px",marginRight:8,color:"#86dec3"}}/>Owner approval required</strong><br/>Use the email address on your signed-in account. The owner can reply directly to your request after reviewing it.</div><StaffRequestForm initialName={user.name??""} initialEmail={user.email??""}/><CancelJoinRequest isPending={false}/></>}</section></main>
}

