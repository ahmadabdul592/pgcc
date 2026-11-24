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
      ...(me.role === "LGA_COORDINATOR" ? { lga: me.lgaId } : lga ? { lga } : {}),
      ...(status ? { status: status as any } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { regNo: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: { _count: { select: { members: { where: { deletedAt: null } } } } },
    orderBy: { regSeq: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">Directory</p><h1 className="page-heading mt-1 font-bold">Organisations</h1></div>
        <Link href="/admin/organizations/new" className="rounded-xl bg-[var(--brand)] px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-[var(--brand-dark)]">New organisation</Link>
      </div>
      <form className="mb-4 flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-white p-3 shadow-sm sm:flex-row sm:p-4">
        <input name="q" defaultValue={q} placeholder="Search name or reg no." className="min-w-0 flex-1" />
        <select name="status" defaultValue={status} className="w-full sm:w-auto">
          <option value="">All</option><option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option><option value="INCOMPLETE">Incomplete</option>
        </select>
        <button className="rounded-xl border border-[var(--line)] px-5 font-semibold text-[var(--brand)] hover:bg-[var(--paper)]">Filter</button>
      </form>
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--paper)]"><tr><th>Reg No.</th><th>Name</th><th>Level</th><th>LGA</th><th>Members</th><th>Status</th></tr></thead>
          <tbody>
          {orgs.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-2"><Link className="underline" href={`/admin/organizations/${regNoToSlug(o.regNo)}`}>{o.regNo}</Link></td>
              <td>{o.name}</td><td>{o.level}</td><td>{o.lga}</td><td>{o._count.members}</td><td>{o.status}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
