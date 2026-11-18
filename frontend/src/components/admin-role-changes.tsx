"use client";

import { useEffect, useState } from "react";

type RoleChange = { id: string; requestedAt: string; user: { name: string | null; email: string } };

export default function AdminRoleChanges() {
  const [requests, setRequests] = useState<RoleChange[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/role-changes");
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to load role change requests."); return; }
      setRequests(data.requests);
    } catch { setError("Connection issue loading role change requests."); }
  }

  useEffect(() => {
    let current = true;
    fetch("/api/admin/role-changes")
      .then(async response => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!current) return;
        if (!response.ok) { setError(data.error ?? "Unable to load role change requests."); return; }
        setRequests(data.requests);
      })
      .catch(() => { if (current) setError("Connection issue loading role change requests."); });
    return () => { current = false; };
  }, []);

  async function decide(id: string, decision: "approve" | "reject") {
    setBusy(id); setError("");
    try {
      const response = await fetch("/api/admin/role-changes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to review this request."); return; }
      await load();
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(""); }
  }

  return <section style={{ marginTop: 30 }}><div className="page-kicker">ROLE ACCESS</div><h2 style={{ fontSize: 21, margin: "10px 0" }}>Staff role change requests</h2><p className="section-copy" style={{ marginTop: 0 }}>A staff member can request Boss access. Approval only works for accounts listed in the server’s OWNER_EMAILS allowlist.</p>{error && <div className="error-banner" role="alert">{error}</div>}<div className="list-card">{requests.length === 0 ? <div className="list-row"><div><strong style={{ fontSize: 12 }}>No pending role changes</strong><p>New staff requests will appear here.</p></div></div> : requests.map(item => <div className="list-row" key={item.id}><div style={{ flex: 1 }}><strong style={{ fontSize: 12 }}>{item.user.name ?? "Staff member"}</strong><p>{item.user.email} requests Boss access</p><small>Requested {new Date(item.requestedAt).toLocaleDateString()}</small></div><div style={{ display: "flex", gap: 8 }}><button className="approve-button" disabled={busy === item.id} onClick={() => void decide(item.id, "approve")}>Approve Boss access</button><button className="approve-button" style={{ color: "#eca59b", borderColor: "#e99b9144", background: "#e99b9110" }} disabled={busy === item.id} onClick={() => void decide(item.id, "reject")}>Decline</button></div></div>)}</div></section>;
}
