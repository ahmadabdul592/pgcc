"use client";
import { useActionState } from "react";
import { submitChange } from "./actions";
import { label } from "@/lib/change-label";

export default function ChangeForm({ cur }: { cur: Record<string, string> }) {
  const [s, action, pending] = useActionState(submitChange, null as any);
  if (s?.ok) return <p className="rounded-xl border border-(--gold) bg-white p-5">Request sent. The Directorate will review it, and your profile changes only after approval.</p>;
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-(--line) bg-white p-5 sm:grid-cols-2">
      {Object.entries(cur).map(([k, v]) => (
        <div key={k}><label htmlFor={k} className="text-sm font-medium">{label(k)}</label>
          {k === "level" ? <select id={k} name={k} defaultValue={v} className="mt-1 w-full">{["NATIONAL", "STATE", "LGA", "WARD"].map((l) => <option key={l}>{l}</option>)}</select>
            : <input id={k} name={k} defaultValue={v} className="mt-1 w-full" required />}
          {s?.error?.[k] && <p role="alert" className="text-sm text-red-700">{s.error[k][0]}</p>}</div>))}
      {s?.error?.form && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{s.error.form[0]}</p>}
      <button disabled={pending} className="rounded-lg bg-(--brand) px-5 py-2.5 font-semibold text-white sm:col-span-2">{pending ? "Sending..." : "Send for approval"}</button>
    </form>);
}
