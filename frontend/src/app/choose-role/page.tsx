import { redirect } from "next/navigation";
import { requireWorkspaceUser } from "@/lib/server-session";
import ChooseRoleClient from "@/components/choose-role-client";
import { prisma } from "@/lib/prisma";

export default async function ChooseRolePage(){
 const sessionUser=await requireWorkspaceUser();
 const user=await prisma.user.findUnique({where:{id:sessionUser.id},select:{status:true,companyId:true}});
 if(!user||user.status!=="NEW"||user.companyId)redirect("/continue");
 const pending=await prisma.accessRequest.findFirst({where:{userId:sessionUser.id,status:"PENDING"},select:{id:true}});
 if(pending)redirect("/staff-request");
 return <ChooseRoleClient/>;
}
