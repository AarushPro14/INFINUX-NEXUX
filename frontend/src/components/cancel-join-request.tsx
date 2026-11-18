"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelJoinRequest({ isPending = true }: { isPending?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    const confirmation = isPending
      ? "Cancel this join request and return to role selection? The owner will no longer see it as pending."
      : "Clear this role choice and return to role selection? You can decide later.";
    if (!window.confirm(confirmation)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/role/reset", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? "Unable to cancel the request."); return; }
      router.replace("/choose-role");
      router.refresh();
    } catch { setError("The cancellation request could not reach the server. Restart the development server, then try again."); }
    finally { setBusy(false); }
  }

  return <div style={{ marginTop: 16 }}>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <button type="button" className="secondary-button" style={{ width: "auto" }} disabled={busy} onClick={() => void cancel()}>
      {busy ? "Cancelling…" : isPending ? "Cancel request and choose another role" : "Cancel and choose a role later"}
    </button>
  </div>;
}
