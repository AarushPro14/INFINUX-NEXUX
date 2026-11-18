"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffCredentialsForm() {
  const router = useRouter();
  const [infxName, setInfxName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [privateCode, setPrivateCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/staff/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ infxName, staffId, password, privateCode }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Unable to verify staff credentials."); return; }
      router.replace("/dashboard"); router.refresh();
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  return <form className="auth-card form-stack" style={{ maxWidth: 530, marginTop: 20 }} onSubmit={submit}>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <label htmlFor="infx-name">Staff INFX Name</label><input id="infx-name" required maxLength={100} value={infxName} onChange={event => setInfxName(event.target.value)} autoComplete="username" />
    <label htmlFor="staff-id-login">Staff ID</label><input id="staff-id-login" required maxLength={40} value={staffId} onChange={event => setStaffId(event.target.value.toUpperCase())} autoComplete="off" />
    <label htmlFor="staff-password-login">Staff password</label><input id="staff-password-login" required type="password" maxLength={128} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" />
    <label htmlFor="staff-private-login">Staff private code</label><input id="staff-private-login" required type="password" maxLength={128} value={privateCode} onChange={event => setPrivateCode(event.target.value)} autoComplete="off" />
    <button className="primary-button" disabled={busy}>{busy ? "Verifying staff…" : "Open staff workspace"}</button>
  </form>;
}
