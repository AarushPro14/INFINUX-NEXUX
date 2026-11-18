"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, BriefcaseBusiness, UserRoundPlus, UsersRound } from "lucide-react";
import ProfileMenu from "@/components/profile-menu";

export default function ChooseRoleClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function choose(role: "STAFF" | "OWNER", destination: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to set your role."); return; }
      router.push(destination);
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  const options = [
    { title: "Staff", description: "Already have staff credentials? Verify them to open your assigned workspace.", label: "Sign in as staff", icon: <UsersRound/>, role: "STAFF" as const, destination: "/staff-login", owner: false },
    { title: "Boss", description: "Verify your authorized owner account and open the business admin panel.", label: "Boss access", icon: <BriefcaseBusiness/>, role: "OWNER" as const, destination: "/owner-verify", owner: true },
    { title: "Join", description: "Send the business owner your details and request access to the company workspace.", label: "Request to join", icon: <UserRoundPlus/>, role: "STAFF" as const, destination: "/staff-request", owner: false },
  ];

  return <main className="app-shell"><div className="site-grid"/><header className="topbar"><Link className="wordmark" href="/">INFINUX <i>NEXUX</i></Link><ProfileMenu name={session?.user?.name} email={session?.user?.email} image={session?.user?.image}/></header><section className="page-container"><div className="page-kicker">WORKSPACE ACCESS</div><h1 className="section-title">Choose your path</h1><p className="section-copy">Sign in as a staff member, continue as the business Boss, or request to join the company. Boss access is restricted to email addresses authorized by the workspace owner.</p>{error&&<div className="error-banner" role="alert">{error}</div>}<div className="role-grid">{options.map(option=><button key={option.title} disabled={busy} className={`role-card${option.owner?" owner":""}`} onClick={()=>void choose(option.role,option.destination)}><div className="role-icon">{option.icon}</div><h2>{option.title}</h2><p>{option.description}</p><span>{option.label} <ArrowRight size={15}/></span></button>)}</div><p className="section-copy" style={{marginTop:28}}>Not sure which role fits yet? You can leave now and decide later.</p><Link className="secondary-button" style={{width:"auto",display:"inline-flex",textDecoration:"none"}} href="/">Cancel and decide later</Link></section></main>;
}

