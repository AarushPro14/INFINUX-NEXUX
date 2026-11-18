import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WorkspaceBrand() {
  const session = await getServerSession(authOptions);
  return <Link className="wordmark" href={session?.user?.id ? "/continue" : "/"} aria-label={session?.user?.id ? "Return to your workspace" : "INFINUX NEXUX home"}>INFINUX <i>NEXUX</i></Link>;
}
