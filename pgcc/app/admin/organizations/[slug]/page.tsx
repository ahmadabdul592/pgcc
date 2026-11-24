import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugToRegNo } from "@/lib/orgs";
import { notFound } from "next/navigation";
import { setStatus, archiveOrganization } from "../actions";

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const me = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"]);
  const { slug } = await params;
  const o = await prisma.organization.findFirst({
    where: { regNo: slugToRegNo(slug) },
    include: { officers: true, members: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 200 } },
  });
  if (!o || (me.role === "LGA_COORDINATOR" && o.lga !== me.lgaId)) notFound();
  const st = (s: "PENDING" | "VERIFIED" | "INCOMPLETE") => async () => { "use server"; await setStatus(o.id, s); };
  const archive = async () => { "use server"; await archiveOrganization(o.id, !!o.deletedAt); };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-sm text-gray-500">{o.regNo}</p>
        <h1 className="text-2xl font-semibold">{o.name} {o.deletedAt && <span className="text-red-600">(archived)</span>}</h1>
        <p className="text-gray-600">{o.level} · {o.address}, {o.lga}, {o.state} · Status: <b>{o.status}</b></p>
      </div>
      <div className="flex flex-wrap gap-2">
        <form action={st("VERIFIED")}><button className="rounded bg-green-700 px-3 py-1 text-white">Verify</button></form>
        <form action={st("INCOMPLETE")}><button className="rounded border px-3 py-1">Mark incomplete</button></form>
        <form action={st("PENDING")}><button className="rounded border px-3 py-1">Mark pending</button></form>
        {me.role !== "LGA_COORDINATOR" && <form action={archive}><button className="rounded border border-red-600 px-3 py-1 text-red-600">{o.deletedAt ? "Restore" : "Archive"}</button></form>}
      </div>
      <section><h2 className="mb-2 font-semibold">Officers</h2>
        <ul className="text-sm">{o.officers.map((x) => <li key={x.id}>{x.title}: {x.name} ({x.phone})</li>)}</ul></section>
      <section><h2 className="mb-2 font-semibold">Members ({o.members.length})</h2>
        <table className="w-full border text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-2">Name</th><th>Phone</th><th>Ward</th><th>Polling unit</th><th>Position</th></tr></thead>
          <tbody>{o.members.map((m) => <tr key={m.id} className="border-t"><td className="p-2">{m.name}</td><td>{m.phone}</td><td>{m.ward}</td><td>{m.pollingUnit}</td><td>{m.position}</td></tr>)}</tbody></table></section>
    </main>);
}
