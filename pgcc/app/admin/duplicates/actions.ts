"use server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ROLES = ["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"] as const;

async function getScopedFlag(id: string, lgaId?: string) {
  const flag = await prisma.duplicateFlag.findUniqueOrThrow({
    where: { id },
    include: { member: { include: { organization: { select: { lga: true } } } } },
  });
  if (lgaId !== undefined) {
    if (flag.member.organization.lga !== lgaId) throw new Error("FORBIDDEN");
    const other = await prisma.member.findFirst({
      where: { id: flag.otherMemberId, deletedAt: null, organization: { lga: lgaId, deletedAt: null } },
      select: { id: true },
    });
    if (!other) throw new Error("FORBIDDEN");
  }
  return flag;
}

/** Member may stay in both groups. */
export async function clearFlag(id: string) {
  const u = await requireRole([...ROLES]);
  await getScopedFlag(id, u.role === "LGA_COORDINATOR" ? u.lgaId ?? "" : undefined);
  await prisma.duplicateFlag.update({ where: { id }, data: { status: "CLEARED" } });
  await prisma.auditLog.create({ data: { userId: u.id, action: "FLAG_CLEARED", entity: "DuplicateFlag", entityId: id } });
  revalidatePath("/admin/duplicates");
}

/** Remove the newly added (flagged) member from its group. */
export async function resolveFlag(id: string) {
  const u = await requireRole([...ROLES]);
  const f = await getScopedFlag(id, u.role === "LGA_COORDINATOR" ? u.lgaId ?? "" : undefined);
  await prisma.$transaction([
    prisma.member.update({ where: { id: f.memberId }, data: { deletedAt: new Date() } }),
    prisma.duplicateFlag.updateMany({ where: { memberId: f.memberId, status: "OPEN" }, data: { status: "RESOLVED" } }),
    prisma.auditLog.create({ data: { userId: u.id, action: "FLAG_RESOLVED", entity: "Member", entityId: f.memberId } }),
  ]);
  revalidatePath("/admin/duplicates");
}
