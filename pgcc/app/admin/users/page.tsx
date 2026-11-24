import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ActionButton from "@/app/components/ActionButton";
import CreateAdminForm from "./CreateAdminForm";
import { resetUserPassword, setUserActive } from "./actions";

export default async function Users() {
  const me = await requireRole(["SUPER_ADMIN"]);
  const users = await prisma.user.findMany({ include: { organization: { select: { name: true, regNo: true } } }, orderBy: [{ role: "asc" }, { createdAt: "desc" }], take: 300 });
  return (
    <main className="space-y-6 p-5 md:p-8">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="max-w-2xl text-sm text-[var(--muted)]">Passwords are stored encrypted and cannot be viewed. Reset a password to generate a temporary one; the user must change it at next login.</p>
      <CreateAdminForm />
      <div className="table-scroll">
        <table className="w-full text-left text-sm"><thead className="bg-[var(--paper)]"><tr><th>Name</th><th>Login</th><th>Role</th><th>Group</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id} className="border-t border-[var(--line)] align-top">
              <td>{u.name}</td><td>{u.email ?? u.phone}</td><td>{u.role.replace("_", " ").toLowerCase()}</td>
              <td>{u.organization?.name ?? u.lgaId ?? "-"}</td><td>{u.active ? "Active" : "Disabled"}</td>
              <td><div className="flex flex-wrap gap-2">
                <ActionButton label="Reset password" run={resetUserPassword.bind(null, u.id)} confirm={`Reset password for ${u.name}?`} />
                {u.id !== me.id && <form action={setUserActive.bind(null, u.id, !u.active)}><button className="rounded-lg border px-3 py-1.5 text-sm">{u.active ? "Disable" : "Enable"}</button></form>}
              </div></td></tr>))}</tbody></table>
      </div>
    </main>);
}
