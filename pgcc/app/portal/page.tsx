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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-sm text-gray-500">{o.regNo}</p>
        <h1 className="text-2xl font-semibold">{o.name}</h1>
        <p className="text-gray-600">{o.level} · {o.lga}, {o.state} · Status: <b>{o.status}</b></p>
        <p className="mt-1 text-xs text-gray-500">To change group details, contact the Directorate.</p>
      </div>
      <section><h2 className="mb-2 font-semibold">Officers</h2><ul className="text-sm">{o.officers.map((x) => <li key={x.id}>{x.title}: {x.name} ({x.phone})</li>)}</ul></section>
      <MemberForms />
      <section><h2 className="mb-2 font-semibold">Members ({o.members.length})</h2>
        <table className="w-full border text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-2">Name</th><th>Phone</th><th>Ward</th><th>Polling unit</th><th>Position</th></tr></thead>
          <tbody>{o.members.map((m) => <tr key={m.id} className="border-t"><td className="p-2">{m.name}</td><td>{m.phone}</td><td>{m.ward}</td><td>{m.pollingUnit}</td><td>{m.position}</td></tr>)}</tbody></table></section>
    </main>);
}
