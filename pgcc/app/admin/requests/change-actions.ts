"use server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { applyChange } from "@/lib/changes";

const ADMINS = ["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"] as const;

async function getScopedRequest(id: string, lgaId?: string) {
  const request = await prisma.changeRequest.findUniqueOrThrow({
    where: { id },
    include: { organization: { select: { lga: true } } },
  });
  if (lgaId !== undefined && request.organization.lga !== lgaId) throw new Error("FORBIDDEN");
  return request;
}

export async function approveChange(id: string) {
  const admin = await requireRole([...ADMINS]);
  const r = await getScopedRequest(id, admin.role === "LGA_COORDINATOR" ? admin.lgaId ?? "" : undefined);
  if (r.status !== "PENDING") return { error: "Already reviewed." };
  try { await applyChange(r.organizationId, r.payload as Record<string, string>); }
  catch (e: any) { if (e.code === "P2002") return { error: "The new chairman phone is already used by another login." }; throw e; }
  await prisma.changeRequest.update({ where: { id }, data: { status: "APPROVED", reviewedBy: admin.id, reviewedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: admin.id, action: "CHANGE_APPROVED", entity: "Organization", entityId: r.organizationId, meta: r.payload as object } });
  return { message: "Approved. The profile has been updated." };
}

export async function rejectChange(id: string) {
  const admin = await requireRole([...ADMINS]);
  await getScopedRequest(id, admin.role === "LGA_COORDINATOR" ? admin.lgaId ?? "" : undefined);
  await prisma.changeRequest.update({ where: { id }, data: { status: "REJECTED", reviewedBy: admin.id, reviewedAt: new Date() } });
  return { message: "Request rejected." };
}
