import { prisma } from "./prisma";

const KEY: Record<string, string> = { CHAIRMAN: "chairman", SECRETARY: "secretary", PRO: "pro", WOMEN_LEADER: "womenLeader" };
export { label } from "./change-label";

/** Flat view of the fields an organisation may ask to change. */
export async function currentValues(orgId: string): Promise<Record<string, string>> {
  const o = await prisma.organization.findUniqueOrThrow({ where: { id: orgId }, include: { officers: true } });
  const v: Record<string, string> = { name: o.name, level: o.level, address: o.address, lga: o.lga };
  for (const f of o.officers) { const k = KEY[f.title]; if (k) { v[k + "Name"] = f.name; v[k + "Phone"] = f.phone; } }
  return v;
}

/** Applies an approved change (only whitelisted keys). */
export async function applyChange(orgId: string, diff: Record<string, string>) {
  const org: Record<string, string> = {};
  for (const k of ["name", "level", "address", "lga"]) if (diff[k]) org[k] = diff[k];
  await prisma.$transaction(async (tx) => {
    if (Object.keys(org).length) await tx.organization.update({ where: { id: orgId }, data: org as any });
    for (const [title, k] of Object.entries(KEY)) {
      const d: Record<string, string> = {};
      if (diff[k + "Name"]) d.name = diff[k + "Name"];
      if (diff[k + "Phone"]) d.phone = diff[k + "Phone"];
      if (Object.keys(d).length) await tx.officer.updateMany({ where: { organizationId: orgId, title }, data: d });
    }
    if (diff.chairmanPhone) await tx.user.updateMany({ where: { organizationId: orgId }, data: { phone: diff.chairmanPhone } }); // login follows chairman
  });
}
