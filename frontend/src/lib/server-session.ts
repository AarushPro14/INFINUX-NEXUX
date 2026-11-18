import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";

export async function requireWorkspaceUser() {
  if (!(await hasEntryAccess())) redirect("/enter");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");
  if (session.user.status === "REMOVED") redirect("/auth?error=access");
  if (session.user.status === "SUSPENDED") redirect("/suspended");
  return session.user;
}
