import { prisma } from "@/lib/prisma";
import { slugToRegNo } from "@/lib/orgs";
import { connection } from "next/server";

// Public: shows ONLY name, level and status. Never member data.
export default async function Verify({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const o = await prisma.organization.findFirst({
    where: { regNo: slugToRegNo(slug), deletedAt: null },
    select: { name: true, level: true, status: true, regNo: true },
  });
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-sm rounded-lg border p-6 text-center">
        {o ? (<><p className="text-sm text-gray-500">{o.regNo}</p><h1 className="mt-1 text-xl font-semibold">{o.name}</h1>
          <p className="mt-1 text-gray-600">{o.level} level</p>
          <p className={`mt-4 font-bold ${o.status === "VERIFIED" ? "text-green-700" : "text-amber-600"}`}>{o.status}</p></>)
          : <p>No registered group found with that number.</p>}
      </div>
    </main>
  );
}
