"use client";

import { FormEvent, useState } from "react";

export default function AdminDataSecurity() {
  const [open, setOpen] = useState(false);
  const [entrySecret, setEntrySecret] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/security/purge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entrySecret, confirmation }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to clear workspace data."); return; }
      setSuccess(`Staff data cleared. Removed ${data.removed.staffAccounts} staff accounts, ${data.removed.staffCredentials} credentials, and ${data.removed.staffRequests + data.removed.roleChangeRequests} requests. Your Boss account and company were kept.`);
      setOpen(false);
    } catch { setError("The request could not reach the server. No completion was confirmed."); }
    finally { setBusy(false); }
  }

  return <section style={{ marginTop: 42, paddingTop: 25, borderTop: "1px solid var(--line)" }}>
    <div className="page-kicker" style={{ color: "#f09a8c" }}>SECURITY CONTROLS</div><h2 style={{ fontSize: 20, margin: "10px 0" }}>Permanently clear staff data</h2>
    <p className="section-copy">This permanently removes this company’s staff accounts, credentials, and staff access requests. Boss accounts and company details are preserved.</p>
    {success && <div className="success-banner" role="status">{success}</div>}
    {!open ? <button type="button" className="approve-button" style={{ color: "#eca59b", borderColor: "#e99b9144", background: "#e99b9110", marginTop: 12 }} onClick={() => { setSuccess(""); setOpen(true); }}>Clear staff data…</button> : <form className="auth-card form-stack" style={{ maxWidth: 590, marginTop: 16, borderColor: "#e99b9144" }} onSubmit={submit}>
      <p style={{ margin: 0, color: "#f0b0a8", fontSize: 12, lineHeight: 1.7 }}>Enter the workspace entry secret and type <strong>DELETE STAFF DATA</strong> to permanently erase this company’s staff records. Boss accounts and company details stay in place.</p>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <label htmlFor="purge-entry-secret">Workspace entry secret</label><input id="purge-entry-secret" type="password" required autoComplete="current-password" value={entrySecret} onChange={event => setEntrySecret(event.target.value)} />
      <label htmlFor="purge-confirmation">Confirmation phrase</label><input id="purge-confirmation" required value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="DELETE STAFF DATA" />
      <div style={{ display: "flex", gap: 10 }}><button className="approve-button" style={{ color: "#eca59b", borderColor: "#e99b9144", background: "#e99b9110" }} disabled={busy}>{busy ? "Deleting data…" : "Permanently delete staff data"}</button><button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>}
  </section>;
}
