import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugToRegNo } from "@/lib/orgs";

const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // block spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const local = (p: string) => p.replace(/^\+234/, "0");
const csv = (rows: unknown[][]) => "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n");

export async function GET(req: Request) {
  const u = (await auth())?.user as any;
  if (!u || !["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"].includes(u.role)) return new Response("Forbidden", { status: 403 });
  const scope = u.role === "LGA_COORDINATOR" ? { lga: u.lgaId } : {};
  const slug = new URL(req.url).searchParams.get("org");
  let body: string, name: string;
  if (slug) {
    const o = await prisma.organization.findFirst({ where: { regNo: slugToRegNo(slug), ...scope }, include: { members: { where: { deletedAt: null }, orderBy: { name: "asc" } } } });
    if (!o) return new Response("Not found", { status: 404 });
    body = csv([["Name", "Phone", "Ward", "Polling unit", "Position"], ...o.members.map((m) => [m.name, local(m.phone), m.ward, m.pollingUnit, m.position])]);
    name = `members-${slug}`;
  } else {
    const orgs = await prisma.organization.findMany({ where: { deletedAt: null, ...scope }, include: { officers: true, _count: { select: { members: { where: { deletedAt: null } } } } }, orderBy: { regSeq: "asc" } });
    body = csv([["Reg No", "Name", "Level", "LGA", "State", "Status", "Members", "Chairman", "Chairman phone"],
      ...orgs.map((o) => { const c = o.officers.find((x) => x.title === "CHAIRMAN"); return [o.regNo, o.name, o.level, o.lga, o.state, o.status, o._count.members, c?.name, c ? local(c.phone) : ""]; })]);
    name = "organizations";
  }
  await prisma.auditLog.create({ data: { userId: u.id, action: "EXPORT", entity: "Export", entityId: name } });
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}.csv"` } });
}
