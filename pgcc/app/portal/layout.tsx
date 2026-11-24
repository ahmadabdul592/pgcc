import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const u = (await auth())?.user as any;
  if (!u) redirect("/login");
  if (u.role !== "ORG_LEADER") redirect("/admin/organizations");
  const row = await prisma.user.findUnique({ where: { id: u.id }, select: { mustChangePassword: true } });
  return (
    <div className="min-h-screen">
      <header className="flex flex-col items-start justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:px-5">
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--brand)]"><img src="/apc.png" alt="Home" className="h-8 w-8" />Organization Database</Link>
        <nav className="flex w-full items-center gap-4 text-sm sm:w-auto">
          <Link href="/portal" className="font-medium text-[var(--muted)] hover:text-[var(--brand)] hover:underline">My group</Link>
          <Link href="/portal/settings" className="font-medium text-[var(--muted)] hover:text-[var(--brand)] hover:underline">Settings</Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}><button className="rounded-lg border px-3 py-1.5">Log out</button></form>
        </nav>
      </header>
      {row?.mustChangePassword && <Link href="/portal/settings" className="block bg-amber-100 px-5 py-3 text-sm font-medium text-amber-900">You are using a temporary password. Change it now in Settings.</Link>}
      {children}
    </div>);
}
