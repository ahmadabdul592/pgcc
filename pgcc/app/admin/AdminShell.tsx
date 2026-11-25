"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/admin/organizations", label: "Organisations" },
  { href: "/admin/organizations/new", label: "New organisation" },
  { href: "/admin/duplicates", label: "Duplicate review" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({ name, role, logout, mustChange, children }: { mustChange?: boolean; name: string; role: string; logout: () => Promise<void>; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin/organizations" ? path.startsWith(h) && !path.endsWith("/new") : path === h);

  return (
    <div className="min-h-screen md:flex">
      <div className="flex items-center justify-between bg-[var(--brand-dark)] px-4 py-3 text-white md:hidden">
        <Link href="/" className="flex items-center gap-2 font-bold"><img src="/apc.png" alt="Home" className="h-8 w-8 rounded-full bg-white" />Organization Database</Link>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="rounded border border-white/40 px-3">{open ? "Close" : "Menu"}</button>
      </div>
      <aside className={`${open ? "block" : "hidden"} w-full shrink-0 bg-[var(--brand-dark)] text-white md:sticky md:top-0 md:block md:h-screen md:w-64`}>
        <Link href="/" className="hidden items-center gap-2 px-5 py-6 text-lg font-bold md:flex"><img src="/apc.png" alt="Home" className="h-9 w-9 rounded-full bg-white" />Organization Database</Link>
        <nav className="space-y-1 px-3 py-2">
          {[
            { href: "/admin", label: "Dashboard" },
            nav[0],
            ...(role === "LGA_COORDINATOR" ? [nav[2]] : nav.slice(1, 3)),
            { href: "/admin/requests", label: "Requests" },
            ...(role === "SUPER_ADMIN" ? [{ href: "/admin/users", label: "Users" }] : []),
            nav[3],
          ].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${active(n.href) ? "bg-[var(--gold)] text-[var(--ink)]" : "text-green-50 hover:bg-white/10"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/15 px-5 py-4 md:absolute md:bottom-0 md:w-64">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-green-200">{role.replace("_", " ").toLowerCase()}</p>
          <form action={logout}><button className="mt-3 w-full rounded-lg border border-white/40 py-2 text-sm hover:bg-white/10">Log out</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{mustChange && <a href="/admin/settings" className="block bg-amber-100 px-5 py-3 text-sm font-medium text-amber-900">You are using a temporary password. Change it now in Settings.</a>}{children}</div>
    </div>
  );
}
