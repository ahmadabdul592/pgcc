import { requireRole } from "@/lib/auth";
import { listOpenFlags } from "@/lib/duplicates";
import { clearFlag, resolveFlag } from "./actions";

export default async function Duplicates() {
  const me = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"]);
  const lga = me.role === "LGA_COORDINATOR" ? me.lgaId ?? "" : undefined;
  const rows = await listOpenFlags(lga);
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Duplicate members ({rows.length} open)</h1>
      {rows.length === 0 && <p className="text-gray-500">Nothing to review.</p>}
      <div className="space-y-3">
        {rows.map(({ flag, other }) => (
          <div key={flag.id} className="rounded border p-4 text-sm">
            <p className="mb-2 font-medium">{flag.reason === "SAME_PHONE" ? "Same phone number" : "Same name and polling unit"}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><b>New:</b> {flag.member.name} · {flag.member.phone}<br />{flag.member.organization.name} ({flag.member.organization.regNo})</div>
              <div><b>Existing:</b> {other?.name} · {other?.phone}<br />{other?.organization.name} ({other?.organization.regNo})</div>
            </div>
            <div className="mt-3 flex gap-2">
              <form action={clearFlag.bind(null, flag.id)}><button className="rounded border px-3 py-1">Allow in both</button></form>
              <form action={resolveFlag.bind(null, flag.id)}><button className="rounded border border-red-600 px-3 py-1 text-red-600">Remove new member</button></form>
            </div>
          </div>))}
      </div>
    </main>);
}
