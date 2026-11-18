"use client";

import { FormEvent, useEffect, useState } from "react";

type StaffRecord = { id: string; infxName: string; staffId: string; active: boolean; claimedByUserId: string | null; createdAt: string; claimedByUser: { name: string | null; email: string; status: string } | null };
type StaffForm = { id?: string; infxName: string; staffId: string; password: string; privateCode: string };
const emptyForm = (): StaffForm => ({ infxName: "", staffId: "", password: "", privateCode: "" });

export default function AdminStaffCredentials() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [form, setForm] = useState<StaffForm | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/staff");
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "Unable to load staff records."); return; }
    setStaff(data.staff);
  }
  useEffect(() => {
    let current = true;
    fetch("/api/admin/staff")
      .then(async response => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!current) return;
        if (!response.ok) { setError(data.error ?? "Unable to load staff records."); return; }
        setStaff(data.staff);
      })
      .catch(() => { if (current) setError("Connection issue loading staff records."); });
    return () => { current = false; };
  }, []);

  function edit(record: StaffRecord) { setNotice(""); setError(""); setForm({ id: record.id, infxName: record.infxName, staffId: record.staffId, password: "", privateCode: "" }); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!form) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/staff", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form.id ? { ...form, action: "edit" } : form) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to save staff credentials."); return; }
      setForm(null); setNotice(form.id ? "Staff details and credentials updated." : "Staff credentials created."); await load();
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  async function toggle(record: StaffRecord) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id, active: !record.active }) });
      const data = await response.json(); if (!response.ok) { setError(data.error ?? "Unable to update staff status."); return; }
      await load();
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  async function remove(record: StaffRecord) {
    if (!window.confirm(`Delete staff record ${record.staffId}? A linked account will lose company access and return to role selection.`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/staff?id=${encodeURIComponent(record.id)}`, { method: "DELETE" });
      const data = await response.json(); if (!response.ok) { setError(data.error ?? "Unable to delete staff."); return; }
      await load();
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  return <section style={{ marginTop: 38 }}>
    <div className="page-kicker">STAFF DIRECTORY</div><h2 style={{ fontSize: 21, margin: "10px 0" }}>Staff accounts</h2>
    <p className="section-copy" style={{ marginTop: 0 }}>Only Bosses can create and manage staff. Credentials are encrypted for on-site delivery and also stored as password hashes for sign-in verification.</p>
    {error && <div className="error-banner" role="alert">{error}</div>}{notice && <div className="success-banner" role="status">{notice}</div>}
    <button type="button" className="primary-button" style={{ width: "fit-content", marginTop: 14 }} onClick={() => { setForm(emptyForm()); setNotice(""); setError(""); }}>Create staff</button>
    {form && <form className="auth-card form-stack" style={{ maxWidth: 590, marginTop: 16 }} onSubmit={save}>
      <h3 style={{ margin: "0 0 8px" }}>{form.id ? "Edit staff credentials" : "Create staff credentials"}</h3>
      <label htmlFor="staff-infx-name">Staff INFX Name</label><input id="staff-infx-name" required minLength={2} maxLength={100} value={form.infxName} onChange={e => setForm({ ...form, infxName: e.target.value })} />
      <label htmlFor="staff-id">Staff ID</label><input id="staff-id" required minLength={3} maxLength={40} value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value.toUpperCase() })} autoComplete="off" />
      <label htmlFor="staff-password">Staff password {form.id && "(enter new password)"}</label><input id="staff-password" type="password" required minLength={10} maxLength={128} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
      <label htmlFor="staff-private-code">Staff private code</label><input id="staff-private-code" type="password" required minLength={8} maxLength={128} value={form.privateCode} onChange={e => setForm({ ...form, privateCode: e.target.value })} autoComplete="new-password" />
      <div style={{ display: "flex", gap: 10 }}><button className="primary-button" disabled={busy}>{busy ? "Saving…" : form.id ? "Save changes" : "Create staff"}</button><button type="button" className="secondary-button" onClick={() => setForm(null)}>Cancel</button></div>
    </form>}
    <div className="list-card" style={{ marginTop: 18 }}>{staff.length === 0 ? <div className="list-row"><div><strong style={{ fontSize: 12 }}>No staff records</strong><p>Create staff here or approve a join request and assign credentials.</p></div></div> : staff.map(record => <div className="list-row" key={record.id}>
      <div style={{ flex: 1 }}><strong style={{ fontSize: 12 }}>{record.infxName}</strong><p>{record.staffId} · {record.claimedByUser?.email ?? "Credentials ready for account linking"}</p><small>{record.active ? "Enabled" : "Disabled"}{record.claimedByUser ? ` · ${record.claimedByUser.status.toLowerCase()}` : " · Not linked yet"}</small></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "flex-end" }}><button type="button" className="approve-button" onClick={() => edit(record)}>Edit credentials</button><button type="button" className="approve-button" disabled={busy} onClick={() => void toggle(record)}>{record.active ? "Disable" : "Enable"}</button><button type="button" className="approve-button" style={{ color: "#eca59b", borderColor: "#e99b9144", background: "#e99b9110" }} disabled={busy} onClick={() => void remove(record)}>Delete</button></div>
    </div>)}</div>
  </section>;
}
