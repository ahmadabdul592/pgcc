import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { prisma } from "./prisma";
import { normalizePhone } from "./duplicates";
import { formatRegNo, regNoToSlug } from "./orgs";

const phone = z.string().transform((v, ctx) => {
  const p = normalizePhone(v);
  if (!p) ctx.addIssue({ code: "custom", message: "Invalid phone number" });
  return p as string;
});
const nm = z.string().min(2);

export const orgSchema = z.object({
  name: z.string().min(3), dateEstablished: z.string().optional(),
  level: z.enum(["NATIONAL", "STATE", "LGA", "WARD"]),
  address: z.string().min(5), lga: z.string().min(2), state: z.string().default("Kano"),
  chairmanName: nm, chairmanPhone: phone, secretaryName: nm, secretaryPhone: phone,
  proName: nm, proPhone: phone, womenLeaderName: nm, womenLeaderPhone: phone,
});
export type OrgData = z.infer<typeof orgSchema>;

/** Creates org + officers + org-leader login. Throws Prisma P2002 if phone/email already has a login. */
export async function createOrgRecord(d: OrgData, adminId: string, email?: string) {
  const tempPassword = randomBytes(5).toString("hex");
  const regNo = await prisma.$transaction(async (tx) => {
    const o = await tx.organization.create({ data: {
      regNo: `TMP-${randomUUID()}`, name: d.name.trim(), level: d.level, address: d.address, lga: d.lga, state: d.state,
      dateEstablished: d.dateEstablished ? new Date(d.dateEstablished) : null } });
    const regNo = formatRegNo(o.regSeq);
    await tx.organization.update({ where: { id: o.id }, data: { regNo } });
    await tx.officer.createMany({ data: [
      { organizationId: o.id, title: "CHAIRMAN", name: d.chairmanName, phone: d.chairmanPhone },
      { organizationId: o.id, title: "SECRETARY", name: d.secretaryName, phone: d.secretaryPhone },
      { organizationId: o.id, title: "PRO", name: d.proName, phone: d.proPhone },
      { organizationId: o.id, title: "WOMEN_LEADER", name: d.womenLeaderName, phone: d.womenLeaderPhone } ] });
    await tx.user.create({ data: { name: d.chairmanName, phone: d.chairmanPhone, email: email?.toLowerCase(), role: "ORG_LEADER",
      organizationId: o.id, mustChangePassword: true, passwordHash: await bcrypt.hash(tempPassword, 10) } });
    await tx.auditLog.create({ data: { userId: adminId, action: "ORG_CREATED", entity: "Organization", entityId: o.id, meta: { regNo } } });
    return regNo;
  });
  return { regNo, slug: regNoToSlug(regNo), loginPhone: d.chairmanPhone, tempPassword };
}
