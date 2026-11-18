"use client";

import { useEffect, useState } from "react";

type Issued = { infxName: string; staffId: string; password: string; privateCode: string };

export default function StaffIssuedCredentials() {
  const [credentials, setCredentials] = useState<Issued | null>(null);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    fetch("/api/staff/credentials").then(async response => {
      const data = await response.json();
      if (response.ok) setCredentials(data.credentials);
      else if (response.status !== 404) setError(data.error ?? "Unable to load assigned credentials.");
    }).catch(() => setError("Unable to load assigned credentials."));
  }, []);
  if (!credentials && !error) return null;
  return <section style={{ marginTop: 28 }}><div className="page-kicker">BOSS-ASSIGNED ACCESS</div><h2 style={{ fontSize: 20, margin: "10px 0" }}>Your staff credentials</h2>{error ? <div className="error-banner">{error}</div> : credentials && <div className="status-panel"><p>These credentials were assigned by your Boss. Keep them private.</p><p><strong>INFX Name:</strong> {credentials.infxName}</p><p><strong>Staff ID:</strong> {credentials.staffId}</p><p><strong>Password:</strong> {visible ? credentials.password : "••••••••••••"}</p><p><strong>Private code:</strong> {visible ? credentials.privateCode : "••••••••••••"}</p><button type="button" className="approve-button" onClick={() => setVisible(value => !value)}>{visible ? "Hide credentials" : "Show credentials"}</button></div>}</section>;
}
