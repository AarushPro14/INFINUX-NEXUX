"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleAccessControls({ role, status, hasPendingRequest }: { role: string; status: string; hasPendingRequest: boolean }) {
  const router = useRouter();
  const [entrySecret, setEntrySecret] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(hasPendingRequest);

  async function send(action: "request-owner" | "owner-reset", secret?: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/role/change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, entrySecret: secret }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to change role."); return; }
      if (action === "owner-reset") { router.replace(data.destination); router.refresh(); return; }
      setPending(true);
      setMessage("Your request was sent to the Boss for approval. Your staff access stays active while it is reviewed.");
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  function submitBossReset(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send("owner-reset", entrySecret); }
  if (role === "OWNER" && status === "ACTIVE") return <section style={{ marginTop: 34, paddingTop: 24, borderTop: "1px solid var(--line)" }}><div className="page-kicker">ROLE SETTINGS</div><h2 style={{ fontSize: 20, margin: "10px 0" }}>Change Boss role</h2><p className="section-copy">Enter the workspace access key to leave the Boss role and return to role selection. Your company and other Boss accounts stay intact.</p><form className="auth-card form-stack" style={{ maxWidth: 530, marginTop: 16 }} onSubmit={submitBossReset}><label htmlFor="role-change-entry-secret">Workspace entry access key</label><input id="role-change-entry-secret" type="password" required autoComplete="current-password" value={entrySecret} onChange={event => setEntrySecret(event.target.value)} />{error && <div className="error-banner" role="alert">{error}</div>}<button className="secondary-button" disabled={busy}>{busy ? "Checking key…" : "Verify key and choose a different role"}</button></form></section>;
  if (role === "STAFF" && status === "ACTIVE") return <section style={{ marginTop: 34, paddingTop: 24, borderTop: "1px solid var(--line)" }}><div className="page-kicker">ROLE SETTINGS</div><h2 style={{ fontSize: 20, margin: "10px 0" }}>Request a role change</h2><p className="section-copy">Request Boss access from your company’s owner. The owner must approve it, and the account must be on the Boss allowlist.</p>{error && <div className="error-banner" role="alert">{error}</div>}{message && <div className="success-banner" role="status">{message}</div>}{pending ? <div className="status-panel">Your Boss access request is waiting for the owner to review it. Your staff access remains active.</div> : <button type="button" className="secondary-button" style={{ maxWidth: 530, marginTop: 12 }} disabled={busy} onClick={() => void send("request-owner")}>{busy ? "Sending request…" : "Request Boss access"}</button>}</section>;
  return null;
}
