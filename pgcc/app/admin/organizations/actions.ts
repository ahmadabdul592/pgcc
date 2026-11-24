"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { normalizePhone } from "@/lib/duplicates";
import { formatRegNo, regNoToSlug } from "@/lib/orgs";

const phone = z.string().transform((v, ctx) => {
  const p = normalizePhone(v);
  if (!p) ctx.addIssue({ code: "custom", message: "Invalid phone number" });
  return p as string;
});

const orgSchema = z.object({
  name: z.string().min(3),
  dateEstablished: z.string().optional(),
  level: z.enum(["NATIONAL", "STATE", "LGA", "WARD"]),
  address: z.string().min(5),
  lga: z.string().min(2),
  state: z.string().default("Kano"),
  chairmanName: z.string().min(2), chairmanPhone: phone,
  secretaryName: z.string().min(2), secretaryPhone: phone,
  proName: z.string().min(2), proPhone: phone,
  womenLeaderName: z.string().min(2), womenLeaderPhone: phone,
});

const ADMINS = ["SUPER_ADMIN", "STATE_ADMIN"] as const;
const log = (userId: string, action: string, entityId: string, meta?: object) =>
  prisma.auditLog.create({ data: { userId, action, entity: "Organization", entityId, meta } });

/** Creates the org, its auto reg number, 4 officers, and the org-leader login (chairman's phone). */
export async function createOrganization(_: unknown, fd: FormData) {
  const admin = await requireRole([...ADMINS]);
  const parsed = orgSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  const tempPassword = randomBytes(5).toString("hex");

  try {
    const regNo = await prisma.$transaction(async (tx) => {
      const o = await tx.organization.create({
        data: {
          regNo: `TMP-${randomUUID()}`, // replaced below using the auto sequence
          name: d.name.trim(), level: d.level, address: d.address, lga: d.lga, state: d.state,
          dateEstablished: d.dateEstablished ? new Date(d.dateEstablished) : null,
        },
      });
      const regNo = formatRegNo(o.regSeq);
      await tx.organization.update({ where: { id: o.id }, data: { regNo } });
      await tx.officer.createMany({
        data: [
          { organizationId: o.id, title: "CHAIRMAN", name: d.chairmanName, phone: d.chairmanPhone },
          { organizationId: o.id, title: "SECRETARY", name: d.secretaryName, phone: d.secretaryPhone },
          { organizationId: o.id, title: "PRO", name: d.proName, phone: d.proPhone },
          { organizationId: o.id, title: "WOMEN_LEADER", name: d.womenLeaderName, phone: d.womenLeaderPhone },
        ],
      });
      await tx.user.create({
        data: {
          name: d.chairmanName, phone: d.chairmanPhone, role: "ORG_LEADER", mustChangePassword: true,
          organizationId: o.id, passwordHash: await bcrypt.hash(tempPassword, 10),
        },
      });
      await tx.auditLog.create({ data: { userId: admin.id, action: "ORG_CREATED", entity: "Organization", entityId: o.id, meta: { regNo } } });
      return regNo;
    });
    revalidatePath("/admin/organizations");
    return { ok: true as const, regNo, slug: regNoToSlug(regNo), loginPhone: d.chairmanPhone, tempPassword }; // show ONCE
  } catch (e: any) {
    if (e.code === "P2002") return { error: { chairmanPhone: ["This phone already has a login"] } };
    return { error: { name: ["Something went wrong. Please check the details and try again."] } };
  }
}

/** Direct admin edit of core fields. (Orgs themselves go through change requests in Phase 4.) */
export async function updateOrganization(id: string, fd: FormData) {
  const admin = await requireRole([...ADMINS]);
  const p = orgSchema.pick({ name: true, level: true, address: true, lga: true, state: true }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.flatten().fieldErrors };
  await prisma.organization.update({ where: { id }, data: p.data });
  await log(admin.id, "ORG_UPDATED", id, p.data);
  revalidatePath("/admin/organizations");
  return { ok: true as const };
}

export async function setStatus(id: string, status: "PENDING" | "VERIFIED" | "INCOMPLETE", remarks?: string) {
  const admin = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { id } });
  if (admin.role === "LGA_COORDINATOR" && org.lga !== admin.lgaId) throw new Error("FORBIDDEN");
  await prisma.organization.update({
    where: { id },
    data: { status, remarks, verifiedAt: status === "VERIFIED" ? new Date() : null },
  });
  await log(admin.id, "STATUS_" + status, id, { remarks });
  revalidatePath("/admin/organizations");
}

/** Soft delete: record kept, login disabled, hidden from lists. */
export async function archiveOrganization(id: string, restore = false) {
  const admin = await requireRole([...ADMINS]);
  await prisma.$transaction([
    prisma.organization.update({ where: { id }, data: { deletedAt: restore ? null : new Date() } }),
    prisma.user.updateMany({ where: { organizationId: id }, data: { active: restore } }),
  ]);
  await log(admin.id, restore ? "ORG_RESTORED" : "ORG_ARCHIVED", id);
  revalidatePath("/admin/organizations");
}

export async function resetOrgPassword(id: string) {
  const admin = await requireRole([...ADMINS]);
  const tempPassword = randomBytes(5).toString("hex");
  await prisma.user.update({ where: { organizationId: id }, data: { passwordHash: await bcrypt.hash(tempPassword, 10) } });
  await log(admin.id, "PASSWORD_RESET", id);
  return { tempPassword };
}
