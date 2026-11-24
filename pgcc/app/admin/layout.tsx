import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, signOut } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const u = (await auth())?.user as any;
  if (!u) redirect("/login");
  if (u.role === "ORG_LEADER") redirect("/portal");
  const logout = async () => { "use server"; await signOut({ redirectTo: "/login" }); };
  return <AdminShell name={u.name ?? "Admin"} role={u.role} logout={logout}>{children}</AdminShell>;
}
