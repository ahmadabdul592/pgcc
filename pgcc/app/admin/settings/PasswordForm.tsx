"use client";
import { useActionState } from "react";
import { changePassword } from "./actions";

export default function PasswordForm() {
  const [s, action, pending] = useActionState(changePassword, null as any);
  return (
    <form action={action} className="max-w-md space-y-3 rounded-xl border border-[var(--line)] bg-white p-5">
      <h2 className="text-lg font-bold">Change password</h2>
      {[["current", "Current password"], ["next", "New password"], ["again", "Repeat new password"]].map(([n, l]) => (
        <div key={n}><label htmlFor={n} className="text-sm font-medium">{l}</label>
          <input id={n} name={n} type="password" className="mt-1 w-full" required minLength={n === "current" ? 1 : 8} /></div>
      ))}
      <button disabled={pending} className="rounded-lg bg-[var(--brand)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--brand-dark)]">{pending ? "Saving..." : "Save password"}</button>
      {s?.error && <p role="alert" className="text-sm text-red-700">{s.error}</p>}
      {s?.ok && <p className="text-sm text-green-700">{s.ok}</p>}
    </form>
  );
}
