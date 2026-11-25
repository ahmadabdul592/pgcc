"use server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { applyChange } from "@/lib/changes";

const ADMINS = ["SUPER_ADMIN", "STATE_ADMIN"] as const;

export async function approveChange(id: string) {
  const admin = await requireRole([...ADMINS]);
  const r = await prisma.changeRequest.findUniqueOrThrow({ where: { id } });
  if (r.status !== "PENDING") return { error: "Already reviewed." };
  try { await applyChange(r.organizationId, r.payload as Record<string, string>); }
  catch (e: any) { if (e.code === "P2002") return { error: "The new chairman phone is already used by another login." }; throw e; }
  await prisma.changeRequest.update({ where: { id }, data: { status: "APPROVED", reviewedBy: admin.id, reviewedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: admin.id, action: "CHANGE_APPROVED", entity: "Organization", entityId: r.organizationId, meta: r.payload as object } });
  return { message: "Approved. The profile has been updated." };
}

export async function rejectChange(id: string) {
  const admin = await requireRole([...ADMINS]);
  await prisma.changeRequest.update({ where: { id }, data: { status: "REJECTED", reviewedBy: admin.id, reviewedAt: new Date() } });
  return { message: "Request rejected." };
}
