import { prisma } from "@/lib/prisma";
import { currentValues, label } from "@/lib/changes";
import ActionButton from "@/app/components/ActionButton";
import { approveChange, rejectChange } from "./change-actions";

const when = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function ChangeRequests({ lgaId }: { lgaId?: string }) {
  const inc = { organization: { select: { name: true, regNo: true } } };
  const [list, done] = await Promise.all([
    prisma.changeRequest.findMany({
      where: { status: "PENDING", ...(lgaId === undefined ? {} : { organization: { lga: lgaId } }) },
      orderBy: { createdAt: "asc" },
      include: inc,
    }),
    prisma.changeRequest.findMany({
      where: { status: { not: "PENDING" }, ...(lgaId === undefined ? {} : { organization: { lga: lgaId } }) },
      orderBy: { reviewedAt: "desc" },
      take: 15,
      include: inc,
    }),
  ]);
  const curs = new Map<string, Record<string, string>>();
  for (const id of new Set(list.map((r) => r.organizationId))) curs.set(id, await currentValues(id));
  return (
    <>
      <section><h2 className="text-2xl font-bold">Change requests ({list.length} waiting)</h2>
        <p className="text-sm text-[var(--muted)]">Every request is kept separately, oldest first. Approving one never replaces another.</p>
        {list.length === 0 && <p className="mt-2 text-[var(--muted)]">No requests waiting.</p>}
        <div className="mt-3 space-y-3">{list.map((r, i) => { const cur = curs.get(r.organizationId)!; return (
          <div key={r.id} className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm">
            <p className="text-base font-bold">{r.organization.name} <span className="font-normal text-[var(--muted)]">{r.organization.regNo}</span></p>
            <p className="text-xs text-[var(--muted)]">Request #{i + 1} · sent {when(r.createdAt)}</p>
            <ul className="mt-2 space-y-1">{Object.entries(r.payload as Record<string, string>).map(([k, v]) => (
              <li key={k}><b>{label(k)}:</b> <span className="text-red-700 line-through">{cur[k]}</span> → <span className="font-medium text-green-800">{v}</span></li>))}</ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton label="Approve" run={approveChange.bind(null, r.id)} />
              <ActionButton label="Reject" danger run={rejectChange.bind(null, r.id)} confirm="Reject this change?" /></div>
          </div>); })}</div></section>
      {done.length > 0 && <section><h2 className="text-xl font-bold">Recently reviewed</h2>
        <ul className="mt-2 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-white text-sm">{done.map((r) => (
          <li key={r.id} className="flex flex-wrap justify-between gap-2 p-3"><span><b>{r.organization.name}</b> · {Object.keys(r.payload as object).map(label).join(", ")}</span>
            <span className={r.status === "APPROVED" ? "text-green-700" : "text-red-700"}>{r.status.toLowerCase()} {r.reviewedAt && when(r.reviewedAt)}</span></li>))}</ul></section>}
    </>);
}
