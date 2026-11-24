"use server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ROLES = ["SUPER_ADMIN", "STATE_ADMIN"] as const;

/** Member may stay in both groups. */
export async function clearFlag(id: string) {
  const u = await requireRole([...ROLES]);
  await prisma.duplicateFlag.update({ where: { id }, data: { status: "CLEARED" } });
  await prisma.auditLog.create({ data: { userId: u.id, action: "FLAG_CLEARED", entity: "DuplicateFlag", entityId: id } });
  revalidatePath("/admin/duplicates");
}

/** Remove the newly added (flagged) member from its group. */
export async function resolveFlag(id: string) {
  const u = await requireRole([...ROLES]);
  const f = await prisma.duplicateFlag.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.member.update({ where: { id: f.memberId }, data: { deletedAt: new Date() } }),
    prisma.duplicateFlag.updateMany({ where: { memberId: f.memberId, status: "OPEN" }, data: { status: "RESOLVED" } }),
    prisma.auditLog.create({ data: { userId: u.id, action: "FLAG_RESOLVED", entity: "Member", entityId: f.memberId } }),
  ]);
  revalidatePath("/admin/duplicates");
}
