import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = (await auth())?.user as any;
  if (!u) redirect("/login");
  if (u.role === "ORG_LEADER") redirect("/portal");
  return <div className="min-h-screen">{children}</div>;
}
