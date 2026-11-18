"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function ProfileMenu({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const label = name?.trim() || email || "Profile";
  const initials = label.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false); }
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onPointerDown); document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("mousedown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, []);

  const workspaceHref = pathname === "/profile" ? "/continue" : "/profile";

  async function logout() {
    setOpen(false);
    await fetch("/api/entry", { method: "DELETE" });
    await signOut({ callbackUrl: "/", redirect: true });
  }

  return <div className="profile-menu" ref={menuRef}>
    <button type="button" className="profile-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-haspopup="menu" aria-label="Open profile menu">
      <span className="profile-avatar" style={image ? { backgroundImage: `url("${image}")`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" } : undefined}>{initials}</span><span className="profile-trigger-name">{label}</span>
    </button>
    {open && <div className="profile-popover" role="menu">
      <div className="profile-summary"><span className="profile-avatar large" style={image ? { backgroundImage: `url("${image}")`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" } : undefined}>{initials}</span><div><strong>{label}</strong><span>{email}</span></div></div>
      <a href="/work" role="menuitem" onClick={() => setOpen(false)}><UserRound size={15}/> Work Page</a>
      <a href="/profile" role="menuitem" onClick={() => setOpen(false)}><Settings size={15}/> Profile settings</a>
      <a href={workspaceHref} role="menuitem" onClick={() => setOpen(false)}>{pathname === "/profile" ? <UserRound size={15}/> : <Settings size={15}/>} {pathname === "/profile" ? "Back to workspace" : "View profile"}</a>
      <button type="button" role="menuitem" onClick={logout}><LogOut size={15}/> Log out</button>
    </div>}
  </div>;
}
