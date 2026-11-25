"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { orgSchema } from "@/lib/createOrg";
import { currentValues } from "@/lib/changes";
import { regNoToSlug } from "@/lib/orgs";

const OFFICERS: [string, string][] = [["CHAIRMAN", "chairman"], ["SECRETARY", "secretary"], ["PRO", "pro"], ["WOMEN_LEADER", "womenLeader"]];

/** Admin edits an organisation directly (no approval step). Orgs use change requests instead. */
export async function updateOrgFull(_: unknown, fd: FormData) {
  const admin = await requireRole(["SUPER_ADMIN", "STATE_ADMIN"]);
  const id = String(fd.get("orgId") ?? "");
  const p = orgSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.flatten().fieldErrors as Record<string, string[]> };
  const d = p.data as any;
  const before = await currentValues(id);
  try {
  await prisma.$transaction(async (tx) => {
    await tx.organization.update({ where: { id }, data: {
      name: d.name.trim(), level: d.level, address: d.address, lga: d.lga, state: d.state,
      dateEstablished: d.dateEstablished ? new Date(d.dateEstablished) : null } });
    for (const [title, k] of OFFICERS)
      await tx.officer.upsert({ where: { organizationId_title: { organizationId: id, title } },
        update: { name: d[k + "Name"], phone: d[k + "Phone"] }, create: { organizationId: id, title, name: d[k + "Name"], phone: d[k + "Phone"] } });
    await tx.user.updateMany({ where: { organizationId: id }, data: { phone: d.chairmanPhone } }); // login follows chairman
  });
  } catch (e: any) {
    if (e.code === "P2002") return { error: { chairmanPhone: ["This phone number is already used by another login."] } as Record<string, string[]> };
    throw e;
  }
  const org = await prisma.organization.findUniqueOrThrow({ where: { id } });
  await prisma.auditLog.create({ data: { userId: admin.id, action: "ORG_EDITED", entity: "Organization", entityId: id, meta: { before } } });
  revalidatePath("/admin/organizations");
  redirect(`/admin/organizations/${regNoToSlug(org.regNo)}`);
}
