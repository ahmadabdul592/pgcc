"use server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function createAdmin(_: unknown, fd: FormData) {
  const me = await requireRole(["SUPER_ADMIN"]);
  const name = String(fd.get("name") ?? "").trim(), email = String(fd.get("email") ?? "").trim().toLowerCase();
  const role = fd.get("role") === "LGA_COORDINATOR" ? "LGA_COORDINATOR" : "STATE_ADMIN";
  const lga = String(fd.get("lga") ?? "").trim();
  if (name.length < 2 || !email.includes("@")) return { error: "Enter a name and a valid email." };
  if (role === "LGA_COORDINATOR" && !lga) return { error: "An LGA coordinator needs an LGA." };
  const tempPassword = randomBytes(5).toString("hex");
  try {
    const u = await prisma.user.create({ data: { name, email, role, lgaId: role === "LGA_COORDINATOR" ? lga : null, mustChangePassword: true, passwordHash: await bcrypt.hash(tempPassword, 10) } });
    await prisma.auditLog.create({ data: { userId: me.id, action: "ADMIN_CREATED", entity: "User", entityId: u.id } });
  } catch (e: any) { if (e.code === "P2002") return { error: "That email is already in use." }; throw e; }
  revalidatePath("/admin/users");
  return { ok: `Created. Login: ${email}\nTemporary password: ${tempPassword}\nShown once. Copy it now.` };
}

export async function resetUserPassword(id: string) {
  const me = await requireRole(["SUPER_ADMIN"]);
  const tempPassword = randomBytes(5).toString("hex");
  const u = await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(tempPassword, 10), mustChangePassword: true } });
  await prisma.auditLog.create({ data: { userId: me.id, action: "PASSWORD_RESET", entity: "User", entityId: id } });
  return { message: `New temporary password for ${u.name}:\n${tempPassword}\nShown once. The user must change it at next login.` };
}

export async function setUserActive(id: string, active: boolean) {
  const me = await requireRole(["SUPER_ADMIN"]);
  if (id === me.id) return;
  await prisma.user.update({ where: { id }, data: { active } });
  await prisma.auditLog.create({ data: { userId: me.id, action: active ? "USER_ENABLED" : "USER_DISABLED", entity: "User", entityId: id } });
  revalidatePath("/admin/users");
}
