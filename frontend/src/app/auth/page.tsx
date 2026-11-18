"use client";

import { FormEvent, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (mode === "register") {
        const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
        const data = await response.json();
        if (!response.ok) { setError(data.error ?? "Unable to create your account."); return; }
        setMode("login");
        setPassword("");
        setError("Account created. Sign in with your email and password.");
        return;
      }
      const result = await signIn("credentials", { redirect: false, email, password, callbackUrl: "/enter" });
      if (!result?.ok) { setError("We couldn’t sign you in with those details."); return; }
      router.push("/enter");
    } catch { setError("Connection issue. Please try again."); }
    finally { setBusy(false); }
  }

  async function google() {
    setBusy(true); setError("");
    try {
      await signOut({ redirect: false });
      await signIn("google", { callbackUrl: "/enter" }, { prompt: "select_account" });
    } catch { setError("Unable to start Google sign-in. Please try again."); setBusy(false); }
  }

  return <main className="gate-shell"><div className="site-grid"/><header className="gate-top"><Link href="/" className="back-link">← Home</Link><span className="wordmark"><span className="brand-icon"><Sparkles size={17}/></span> INFINUX <i>NEXUX</i></span><span className="secure-label"><ShieldCheck size={14}/> SECURE SIGN IN</span></header>
    <div className="auth-layout"><section className="auth-intro"><div className="eyebrow">BUSINESS, IN ONE PLACE <span/> AARUSHI INFOTECH</div><h2>One workspace.<br/><span>Infinite possibilities.</span></h2><p>A focused business environment where owners and approved teams can manage work, access, and collaboration with confidence.</p><div className="auth-points"><span><ShieldCheck size={15}/> Protected access</span><span><Sparkles size={15}/> Built for business</span></div></section>
      <section className="auth-card"><div className="auth-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected={mode==="login"} className={mode==="login"?"selected":""} onClick={()=>{setError("");setMode("login")}}>Sign in</button><button type="button" role="tab" aria-selected={mode==="register"} className={mode==="register"?"selected":""} onClick={()=>{setError("");setMode("register")}}>Create account</button></div><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p>{mode === "login" ? "Sign in with your email ID and password, or continue with Google." : "Create an account with your email ID and password, or continue with Google."}</p>
        {error && <div className="error-banner" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={submit}>{mode === "register" && <><label htmlFor="name">Full name</label><input id="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/> </>}<label htmlFor="email">Email ID</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email"/><label htmlFor="password">Password</label><input id="password" type="password" required minLength={mode === "register" ? 12 : 1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "register" ? "At least 12 characters" : "Your password"} autoComplete={mode === "register" ? "new-password" : "current-password"}/><button disabled={busy} className="primary-button">{busy ? "Please wait…" : mode === "login" ? "Sign in with email" : "Create account with email"}</button></form>
        <div className="divider">OR</div><button type="button" className="secondary-button" disabled={busy} onClick={() => void google()}><GoogleMark/> {mode === "register" ? "Create account with Google" : "Continue with Google"}</button>
      </section></div>
  </main>;
}

function GoogleMark(){return <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z"/><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"/><path fill="#4CAF50" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z"/><path fill="#1976D2" d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.2C14.2 15.6 18.7 12 24 12Z"/></svg>}
