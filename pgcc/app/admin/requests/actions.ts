"use server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { orgSchema, createOrgRecord } from "@/lib/createOrg";

const ADMINS = ["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"] as const;

function assertApplicationScope(lga: unknown, admin: { role: string; lgaId?: string }) {
  if (admin.role === "LGA_COORDINATOR" && (!admin.lgaId || lga !== admin.lgaId)) {
    throw new Error("FORBIDDEN");
  }
}

export async function approveApplication(id: string) {
  const admin = await requireRole([...ADMINS]);
  const a = await prisma.application.findUniqueOrThrow({ where: { id } });
  const p = orgSchema.safeParse(a.payload);
  if (!p.success) return { error: "Application data is invalid." };
  assertApplicationScope(p.data.lga, admin);
  if (a.status !== "PENDING") return { error: "Already reviewed." };
  try {
    const r = await createOrgRecord(p.data, admin.id, a.email);
    await prisma.application.update({ where: { id }, data: { status: "APPROVED", reviewedBy: admin.id, reviewedAt: new Date() } });
    return { message: `Approved.\nReg No: ${r.regNo}\nLogin phone: ${r.loginPhone}\nTemporary password: ${r.tempPassword}\nCopy and send this now. It is shown once.` };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "A login with this phone or email already exists." };
    throw e;
  }
}

export async function rejectApplication(id: string) {
  const admin = await requireRole([...ADMINS]);
  const application = await prisma.application.findUniqueOrThrow({ where: { id } });
  const payload = application.payload;
  const lga = typeof payload === "object" && payload !== null && "lga" in payload ? payload.lga : undefined;
  assertApplicationScope(lga, admin);
  await prisma.application.update({ where: { id }, data: { status: "REJECTED", reviewedBy: admin.id, reviewedAt: new Date() } });
  return { message: "Application rejected." };
}

export async function issueResetPassword(requestId: string) {
  const admin = await requireRole([...ADMINS]);
  const r = await prisma.resetRequest.findUniqueOrThrow({ where: { id: requestId } });
  const user = r.userId ? await prisma.user.findUnique({
    where: { id: r.userId },
    include: { organization: { select: { lga: true } } },
  }) : null;
  if (!user) return { error: "No matching account." };
  if (admin.role === "LGA_COORDINATOR" && (user.role !== "ORG_LEADER" || user.organization?.lga !== admin.lgaId)) {
    throw new Error("FORBIDDEN");
  }
  if (user.role !== "ORG_LEADER" && admin.role !== "SUPER_ADMIN") return { error: "Only the super admin can reset an admin account." };
  const tempPassword = randomBytes(5).toString("hex");
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(tempPassword, 10), mustChangePassword: true } }),
    prisma.resetRequest.update({ where: { id: requestId }, data: { status: "DONE" } }),
    prisma.auditLog.create({ data: { userId: admin.id, action: "PASSWORD_RESET", entity: "User", entityId: user.id } }),
  ]);
  return { message: `Password reset for ${user.name}.\nTemporary password: ${tempPassword}\nSend it to the user. It is shown once.` };
}

export async function dismissReset(id: string) {
  const admin = await requireRole([...ADMINS]);
  if (admin.role === "LGA_COORDINATOR") {
    const request = await prisma.resetRequest.findUniqueOrThrow({ where: { id } });
    const user = request.userId ? await prisma.user.findUnique({
      where: { id: request.userId },
      include: { organization: { select: { lga: true } } },
    }) : null;
    if (!user || user.role !== "ORG_LEADER" || user.organization?.lga !== admin.lgaId) throw new Error("FORBIDDEN");
  }
  await prisma.resetRequest.update({ where: { id }, data: { status: "REJECTED" } });
  return { message: "Request dismissed." };
}
