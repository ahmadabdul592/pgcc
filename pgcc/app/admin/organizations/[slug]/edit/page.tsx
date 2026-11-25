import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugToRegNo } from "@/lib/orgs";
import { currentValues } from "@/lib/changes";
import EditForm from "./EditForm";

export default async function EditOrg({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole(["SUPER_ADMIN", "STATE_ADMIN"]);
  const { slug } = await params;
  const o = await prisma.organization.findFirst({ where: { regNo: slugToRegNo(slug) } });
  if (!o) notFound();
  const v = { ...(await currentValues(o.id)), state: o.state, dateEstablished: o.dateEstablished?.toISOString().slice(0, 10) ?? "" };
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-5 md:p-8">
      <div><p className="text-sm text-[var(--muted)]">{o.regNo}</p><h1 className="text-2xl font-bold">Edit organisation</h1></div>
      <EditForm id={o.id} v={v} />
    </main>);
}
