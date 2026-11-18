"use client";

import { FormEvent, useState } from "react";
import { Check, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanySettingsForm({ companyName }: { companyName: string }) {
  const router = useRouter();
  const [name, setName] = useState(companyName);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profile/company", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? "Unable to update company."); return; }
      setName(data.companyName); setNotice("Company name updated."); router.refresh();
    } catch { setError("The company update could not reach the server."); }
    finally { setBusy(false); }
  }
  return <form className="auth-card form-stack" style={{ maxWidth: 560, marginTop: 24 }} onSubmit={submit}>
    <div className="page-kicker">BOSS SETTINGS</div><h2 style={{ margin: "5px 0 10px", fontSize: 20 }}>Edit company</h2>
    {error && <div className="error-banner" role="alert">{error}</div>}{notice && <div className="success-banner" role="status"><Check size={14}/> {notice}</div>}
    <label htmlFor="company-name-edit">Company name</label><input id="company-name-edit" required minLength={2} maxLength={120} value={name} onChange={event => setName(event.target.value)} />
    <button className="primary-button" disabled={busy}><Save size={15}/>{busy ? "Saving…" : "Save company"}</button>
  </form>;
}
