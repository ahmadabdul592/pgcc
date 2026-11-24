import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import PasswordForm from "./PasswordForm";

export default async function Settings() {
  const me = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR"]);
  const u = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
  return (
    <main className="space-y-6 p-5 md:p-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="max-w-md rounded-xl border border-[var(--line)] bg-white p-5">
        <h2 className="text-lg font-bold">Your account</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div><dt className="inline text-[var(--muted)]">Name: </dt><dd className="inline">{u.name}</dd></div>
          <div><dt className="inline text-[var(--muted)]">Email: </dt><dd className="inline">{u.email}</dd></div>
          <div><dt className="inline text-[var(--muted)]">Role: </dt><dd className="inline">{u.role.replace("_", " ").toLowerCase()}</dd></div>
        </dl>
      </section>
      <PasswordForm />
    </main>
  );
}
