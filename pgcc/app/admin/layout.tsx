import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const u = (await auth())?.user as any;
  if (!u) redirect("/login");
  if (u.role === "ORG_LEADER") redirect("/portal");
  const row = await prisma.user.findUnique({ where: { id: u.id }, select: { mustChangePassword: true } });
  const logout = async () => { "use server"; await signOut({ redirectTo: "/login" }); };
  return <AdminShell name={u.name ?? "Admin"} role={u.role} logout={logout} mustChange={!!row?.mustChangePassword}>{children}</AdminShell>;
}
