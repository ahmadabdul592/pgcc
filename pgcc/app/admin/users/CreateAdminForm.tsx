"use client";
import { useActionState } from "react";
import { createAdmin } from "./actions";

export default function CreateAdminForm() {
  const [s, action, pending] = useActionState(createAdmin, null as any);
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--line)] bg-white p-5 sm:grid-cols-2">
      <h2 className="text-lg font-bold sm:col-span-2">Add an admin</h2>
      <input name="name" placeholder="Full name" required /><input name="email" type="email" placeholder="Email" required />
      <select name="role"><option value="STATE_ADMIN">State admin</option><option value="LGA_COORDINATOR">LGA coordinator</option></select>
      <input name="lga" placeholder="LGA (coordinators only)" />
      <button disabled={pending} className="rounded-lg bg-[var(--brand)] px-5 py-2.5 font-semibold text-white sm:col-span-2">{pending ? "Creating..." : "Create admin"}</button>
      {s?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{s.error}</p>}
      {s?.ok && <p className="whitespace-pre-line rounded border border-[var(--gold)] bg-yellow-50 p-3 text-sm sm:col-span-2">{s.ok}</p>}
    </form>);
}
