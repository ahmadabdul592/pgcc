import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { connection } from "next/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const u = (await auth())?.user as any;
  if (!u) redirect("/login");
  if (u.role !== "ORG_LEADER") redirect("/admin/organizations");
  return (
    <div className="min-h-screen">
      <header className="flex justify-between border-b px-6 py-3">
        <b className="text-green-800">Support Group Portal</b>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="underline">Sign out</button></form>
      </header>
      {children}
    </div>);
}
