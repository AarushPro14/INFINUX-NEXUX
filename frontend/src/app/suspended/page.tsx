import { ShieldAlert } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";
import WorkspaceBrand from "@/components/workspace-brand";
export default function SuspendedPage(){return <main className="app-shell"><div className="site-grid"/><header className="topbar"><WorkspaceBrand/><SignOutButton/></header><section className="page-container" style={{maxWidth:650}}><div className="page-kicker">ACCOUNT STATUS</div><h1 className="section-title">Access paused</h1><div className="status-panel"><strong><ShieldAlert size={17} style={{verticalAlign:"-3px",marginRight:8,color:"#f09a8c"}}/>Your account is suspended.</strong><br/>Workspace access is unavailable. Please contact your business administrator for help restoring access.</div></section></main>}
