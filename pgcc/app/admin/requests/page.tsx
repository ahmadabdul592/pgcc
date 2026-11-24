import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ActionButton from "@/app/components/ActionButton";
import { approveApplication, rejectApplication, issueResetPassword, dismissReset } from "./actions";

export default async function Requests() {
  await requireRole(["SUPER_ADMIN", "STATE_ADMIN"]);
  const [apps, resets] = await Promise.all([
    prisma.application.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    prisma.resetRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
  ]);
  const users = await prisma.user.findMany({ where: { id: { in: resets.map((r) => r.userId).filter(Boolean) as string[] } }, select: { id: true, name: true, role: true } });
  const byId = new Map(users.map((u) => [u.id, u]));
  return (
    <main className="space-y-8 p-5 md:p-8">
      <section><h1 className="text-2xl font-bold">Group applications ({apps.length})</h1>
        {apps.length === 0 && <p className="mt-2 text-[var(--muted)]">No applications waiting.</p>}
        <div className="mt-3 space-y-3">{apps.map((a) => { const p = a.payload as any; return (
          <div key={a.id} className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm">
            <p className="text-base font-bold">{p.name} <span className="font-normal text-[var(--muted)]">· {p.level} · {p.lga}</span></p>
            <p className="mt-1">{p.address}</p>
            <p className="text-[var(--muted)]">{a.email} · Chairman: {p.chairmanName} ({p.chairmanPhone}) · Secretary: {p.secretaryName} ({p.secretaryPhone})</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton label="Approve and create login" run={approveApplication.bind(null, a.id)} confirm="Approve this group and generate a temporary password?" />
              <ActionButton label="Reject" danger run={rejectApplication.bind(null, a.id)} confirm="Reject this application?" />
            </div></div>); })}</div></section>
      <section><h2 className="text-2xl font-bold">Password reset requests ({resets.length})</h2>
        {resets.length === 0 && <p className="mt-2 text-[var(--muted)]">No requests waiting.</p>}
        <div className="mt-3 space-y-3">{resets.map((r) => { const u = r.userId ? byId.get(r.userId) : null; return (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white p-4 text-sm">
            <p><b>{u?.name ?? "Unknown"}</b> · {r.identifier} · {u?.role.replace("_", " ").toLowerCase()}</p>
            <div className="flex gap-2">
              <ActionButton label="Issue temporary password" run={issueResetPassword.bind(null, r.id)} />
              <ActionButton label="Dismiss" danger run={dismissReset.bind(null, r.id)} /></div></div>); })}</div></section>
    </main>);
}
