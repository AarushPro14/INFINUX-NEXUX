import { redirect } from "next/navigation";
import { requireWorkspaceUser } from "@/lib/server-session";
import OwnerVerifyForm from "@/components/owner-verify-form";
import { prisma } from "@/lib/prisma";

export default async function OwnerVerifyPage(){
 const user=await requireWorkspaceUser();
 if(user.role!=="OWNER")redirect("/continue");
 if(user.status!=="NEW")redirect("/continue");
 const approvedPromotion=await prisma.roleChangeRequest.findFirst({where:{userId:user.id,status:"APPROVED"},select:{id:true}});
 return <OwnerVerifyForm canCancelRole={!approvedPromotion}/>;
}
