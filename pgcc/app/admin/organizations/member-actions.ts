"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

/** Admin removes a member (soft delete, recorded in the audit log). */
export async function removeMember(id: string) {
  const u = await requireRole(["SUPER_ADMIN", "STATE_ADMIN"]);
  await prisma.member.update({ where: { id }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: u.id, action: "MEMBER_REMOVED", entity: "Member", entityId: id } });
  revalidatePath("/admin/organizations");
  return { message: "Member removed." };
}
