"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function changePassword(_: unknown, fd: FormData) {
  const u = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR", "ORG_LEADER"]);
  const cur = String(fd.get("current")), next = String(fd.get("next")), again = String(fd.get("again"));
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== again) return { error: "The two new passwords do not match." };
  const user = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
  if (!(await bcrypt.compare(cur, user.passwordHash))) return { error: "Current password is incorrect." };
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  await prisma.auditLog.create({ data: { userId: u.id, action: "PASSWORD_CHANGED", entity: "User", entityId: u.id } });
  return { ok: "Password changed." };
}
