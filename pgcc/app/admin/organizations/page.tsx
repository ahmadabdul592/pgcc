import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { regNoToSlug } from "@/lib/orgs";
import Link from "next/link";

export default async function Organizations({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; lga?: string }> }) {
  const me = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"]);
  const { q, status, lga } = await searchParams;
  const orgs = await prisma.organization.findMany({
    where: {
      deletedAt: null,
      ...(me.role === "LGA_COORDINATOR" ? { lga: me.lgaId ?? "" } : lga ? { lga } : {}),
      ...(status ? { status: status as any } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { regNo: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: { _count: { select: { members: { where: { deletedAt: null } } } } },
    orderBy: { regSeq: "desc" },
    take: 100,
  });

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Organisations</h1>
        <div className="flex gap-2"><a href="/admin/export" className="rounded border px-4 py-2">Export CSV</a><Link href="/admin/organizations/new" className="rounded bg-green-700 px-4 py-2 text-white">New organisation</Link></div>
      </div>
      <form className="flex gap-2 mb-4">
        <input name="q" defaultValue={q} placeholder="Search name or reg no." className="border rounded px-3 py-2 flex-1" />
        <select name="status" defaultValue={status} className="border rounded px-3">
          <option value="">All</option><option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option><option value="INCOMPLETE">Incomplete</option>
        </select>
        <button className="border rounded px-4">Filter</button>
      </form>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100 text-left"><tr><th className="p-2">Reg No.</th><th>Name</th><th>Level</th><th>LGA</th><th>Members</th><th>Status</th></tr></thead>
        <tbody>
          {orgs.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-2"><Link className="underline" href={`/admin/organizations/${regNoToSlug(o.regNo)}`}>{o.regNo}</Link></td>
              <td>{o.name}</td><td>{o.level}</td><td>{o.lga}</td><td>{o._count.members}</td><td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
