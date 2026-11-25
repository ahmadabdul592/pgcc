import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { listOpenFlags } from "@/lib/duplicates";

export default async function Dashboard() {
  const me = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"]);
  const scope = me.role === "LGA_COORDINATOR" ? { lga: me.lgaId ?? "" } : {};
  const lgaId = me.role === "LGA_COORDINATOR" ? me.lgaId ?? "" : undefined;
  const coordinatorUsers = lgaId === undefined ? null : await prisma.user.findMany({
    where: { role: "ORG_LEADER", organization: { lga: lgaId } },
    select: { id: true },
  });
  const live = { deletedAt: null, ...scope };
  const [total, verified, pending, incomplete, members, byLga, apps, changes, resets, flags] = await Promise.all([
    prisma.organization.count({ where: live }),
    prisma.organization.count({ where: { ...live, status: "VERIFIED" } }),
    prisma.organization.count({ where: { ...live, status: "PENDING" } }),
    prisma.organization.count({ where: { ...live, status: "INCOMPLETE" } }),
    prisma.member.count({ where: { deletedAt: null, organization: live } }),
    prisma.organization.groupBy({ by: ["lga"], where: live, _count: { _all: true }, orderBy: { _count: { lga: "desc" } }, take: 15 }),
    prisma.application.count({
      where: {
        status: "PENDING",
        ...(lgaId === undefined ? {} : { payload: { path: ["lga"], equals: lgaId } }),
      },
    }),
    prisma.changeRequest.count({
      where: {
        status: "PENDING",
        ...(lgaId === undefined ? {} : { organization: { lga: lgaId } }),
      },
    }),
    prisma.resetRequest.count({
      where: {
        status: "PENDING",
        ...(coordinatorUsers === null ? {} : { userId: { in: coordinatorUsers.map((u) => u.id) } }),
      },
    }),
    lgaId === undefined
      ? prisma.duplicateFlag.count({ where: { status: "OPEN" } })
      : listOpenFlags(lgaId).then((flags) => flags.length),
  ]);
  const max = Math.max(1, ...byLga.map((l) => l._count._all));
  const stat = [["Groups", total], ["Verified", verified], ["Pending", pending], ["Incomplete", incomplete], ["Members", members]];
  const todo: [string, number, string][] = [["Applications", apps, "/admin/requests"], ["Change requests", changes, "/admin/requests"], ["Password resets", resets, "/admin/requests"], ["Duplicates", flags, "/admin/duplicates"]];
  return (
    <main className="space-y-6 p-5 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{stat.map(([l, n]) => (
        <div key={l as string} className="rounded-xl border border-[var(--line)] bg-white p-4"><p className="text-sm text-[var(--muted)]">{l}</p><p className="text-3xl font-bold text-[var(--brand)]">{(n as number).toLocaleString()}</p></div>))}</div>
      <section><h2 className="mb-2 text-lg font-bold">Needs attention</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{todo.map(([l, n, h]) => (
          <Link key={l} href={h} className={`rounded-xl border p-4 ${n ? "border-[var(--gold)] bg-yellow-50" : "border-[var(--line)] bg-white"}`}>
            <p className="text-sm">{l}</p><p className="text-2xl font-bold">{n}</p></Link>))}</div></section>
      <section><h2 className="mb-2 text-lg font-bold">Groups by LGA</h2>
        <div className="space-y-2 rounded-xl border border-[var(--line)] bg-white p-4">
          {byLga.length === 0 && <p className="text-sm text-[var(--muted)]">No groups yet.</p>}
          {byLga.map((l) => (<div key={l.lga} className="flex items-center gap-3 text-sm"><span className="w-32 shrink-0 truncate">{l.lga}</span>
            <div className="h-3 flex-1 rounded bg-[var(--paper)]"><div className="h-3 rounded bg-[var(--brand)]" style={{ width: `${(l._count._all / max) * 100}%` }} /></div><span className="w-8 text-right">{l._count._all}</span></div>))}
        </div></section>
    </main>);
}
