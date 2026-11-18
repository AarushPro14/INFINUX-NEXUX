"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export default function EnterPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remaining, setRemaining] = useState(7);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) {
        if (typeof result.remaining === "number") setRemaining(result.remaining);
        setMessage(result.error ?? "Unable to verify access.");
        setPassword("");
        return;
      }
      // The API response set the HTTP-only entry cookie before this navigation.
      router.push("/continue");
    } catch {
      setMessage("Connection issue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="gate-shell">
    <div className="site-grid" />
    <header className="gate-top"><Link href="/" className="back-link"><ArrowLeft size={16}/> Home</Link><span className="wordmark"><span className="brand-icon"><Sparkles size={17}/></span> INFINUX <i>NEXUX</i></span><span className="secure-label"><ShieldCheck size={14}/> PRIVATE ENTRY</span></header>
    <section className="gate-card">
      <div className="gate-orbit"><span className="orbit-dot"/><div className="gate-emblem"><LockKeyhole size={27}/></div></div>
      <div className="eyebrow">AARUSHI INFOTECH <span/> SECURE WORKSPACE</div>
      <h1>Enter the <em>NEXUX.</em></h1>
      <p className="gate-copy">Verify your workspace access to continue to Staff, Boss, or Join.</p>
      <form onSubmit={submit} className="gate-form">
        <label htmlFor="entry-key">Workspace access key</label>
        <div className="input-wrap"><input id="entry-key" required autoComplete="current-password" type={show ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setMessage(""); }} placeholder="Enter access key"/><button className="icon-button" type="button" aria-label={show ? "Hide access key" : "Show access key"} onClick={() => setShow(!show)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
        {message && <p className="form-message" role="alert">{message}{remaining > 0 && remaining < 7 ? ` ${remaining} attempts remaining.` : ""}</p>}
        <button disabled={busy || remaining === 0} className="primary-button gate-submit">{busy ? "Verifying access…" : "Verify & continue"}<ArrowRight size={16}/></button>
      </form>
      <div className="gate-foot"><ShieldCheck size={15}/> Access attempts are monitored and protected.</div>
    </section>
    <footer className="gate-footer"><span>INFINUX NEXUX</span><span>ONE WORKSPACE. INFINITE POSSIBILITIES.</span></footer>
  </main>;
}
