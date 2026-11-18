"use client";

import { BriefcaseBusiness, CalendarDays, FileClock, LayoutDashboard, UserRound, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "OWNER" | "STAFF";

export default function PanelNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const [adminSection, setAdminSection] = useState("overview");
  useEffect(() => {
    const sync = () => setAdminSection(window.location.hash.slice(1) || "overview");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);
  const items = role === "OWNER" ? [
    { href: "/admin#overview", label: "Overview", icon: LayoutDashboard, active: pathname === "/admin" && adminSection === "overview" },
    { href: "/work", label: "Work Page", icon: BriefcaseBusiness, active: pathname === "/work" },
    { href: "/admin#staff", label: "Staff", icon: Users, active: pathname === "/admin" && adminSection === "staff" },
    { href: "/admin#attendance", label: "Attendance", icon: CalendarDays, active: pathname === "/admin" && adminSection === "attendance" },
    { href: "/admin#requests", label: "Requests", icon: FileClock, active: pathname === "/admin" && adminSection === "requests" },
    { href: "/profile", label: "Profile", icon: UserRound, active: pathname === "/profile" },
  ] : [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, active: pathname === "/dashboard" },
    { href: "/work", label: "Work Page", icon: BriefcaseBusiness, active: pathname === "/work" },
    { href: "/profile", label: "My Profile", icon: UserRound, active: pathname === "/profile" },
    { href: "/release-notes", label: "Updates", icon: FileClock, active: pathname === "/release-notes" },
  ];

  return <nav className="panel-navigation" aria-label={`${role === "OWNER" ? "Boss" : "Staff"} navigation`}>
    {items.map(({ href, label, icon: Icon, active }) => <a key={label} className={`panel-nav-link ${active ? "active" : ""}`} href={href} title={label} aria-label={label} aria-current={active ? "page" : undefined}>
      <Icon size={15}/><span>{label}</span>
    </a>)}
  </nav>;
}
