"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ className = "back-link" }: { className?: string }) {
  async function logout() {
    await fetch("/api/entry", { method: "DELETE" });
    await signOut({ callbackUrl: "/", redirect: true });
  }
  return <button className={className} onClick={logout}>Sign out</button>;
}
