import MemberPhoto from "@/app/components/MemberPhoto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import MemberForms from "./MemberForms";

export default async function Portal() {
  const u = await requireRole(["ORG_LEADER"]);
  const o = await prisma.organization.findUniqueOrThrow({
    where: { id: u.organizationId! },
    include: { officers: true, members: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 500 } },
  });
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-sm font-semibold tracking-wide text-[var(--brand)]">{o.regNo}</p>
        <h1 className="page-heading mt-1 font-bold">{o.name}</h1>
        <p className="text-gray-600">{o.level} · {o.lga}, {o.state} · Status: <b>{o.status}</b></p>
        <p className="mt-1 text-xs text-gray-500">To change group details, contact the Directorate.</p>
      </div>
      <section><h2 className="mb-2 font-semibold">Officers</h2><ul className="text-sm">{o.officers.map((x) => <li key={x.id}>{x.title}: {x.name} ({x.phone})</li>)}</ul></section>
      <MemberForms />
      <section><h2 className="mb-3 text-lg font-bold">Members ({o.members.length})</h2>
        <div className="table-scroll">
          <table className="w-full text-left text-sm"><thead className="bg-[var(--paper)]"><tr><th>Name</th><th>Phone</th><th>Ward</th><th>Polling unit</th><th>Position</th></tr></thead>
            <tbody>{o.members.map((m) => <tr key={m.id}><td><div className="flex items-center gap-3"><MemberPhoto id={m.id} src={m.photoUrl} />{m.name}</div></td><td>{m.phone}</td><td>{m.ward}</td><td>{m.pollingUnit}</td><td>{m.position}</td></tr>)}</tbody></table>
        </div></section>
    </main>);
}
