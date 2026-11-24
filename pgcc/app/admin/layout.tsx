import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/lib/auth";

async function AdminContent({ children }: { children: React.ReactNode }) {
  await connection();
  const u = (await auth())?.user;
  if (!u) redirect("/login");
  if (u.role === "ORG_LEADER") redirect("/portal");
  return <div className="min-h-screen">{children}</div>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
