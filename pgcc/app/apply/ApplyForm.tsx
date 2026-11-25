"use client";
import { useActionState } from "react";
import { submitApplication } from "./actions";
import { KANO_LGAS } from "@/lib/kano-lgas";

const officers = [["chairman", "Chairman"], ["secretary", "Secretary"], ["pro", "P.R.O"], ["womenLeader", "Women Leader"]];

export default function ApplyForm() {
  const [s, action, pending] = useActionState(submitApplication, null as any);
  const err = (k: string) => s?.error?.[k] && <p role="alert" className="text-sm text-red-700">{s.error[k][0]}</p>;
  if (s?.ok) return <div className="rounded-xl border border-[var(--gold)] bg-white p-6"><h2 className="text-xl font-bold text-[var(--brand)]">Application received</h2>
    <p className="mt-2 text-[var(--muted)]">The Directorate will review your details. If approved, your login details will be sent to your chairman&apos;s phone number.</p></div>;
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6 md:p-7">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div><label className="text-sm font-medium">Name of support group</label><input name="name" className="mt-1 w-full" required />{err("name")}</div>
      <div><label className="text-sm font-medium">Group email</label><input name="email" type="email" className="mt-1 w-full" required />{err("email")}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="text-sm font-medium">Date established</label><input name="dateEstablished" type="date" className="mt-1 w-full" /></div>
        <div><label className="text-sm font-medium">Level</label><select name="level" className="mt-1 w-full"><option value="NATIONAL">National</option><option value="STATE">State</option><option value="LGA">LGA</option><option value="WARD">Ward</option></select></div>
      </div>
      <div><label className="text-sm font-medium">Address</label><input name="address" className="mt-1 w-full" required />{err("address")}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="text-sm font-medium">L.G.A</label><select name="lga" className="mt-1 w-full" required defaultValue=""><option value="" disabled>Select local government</option>{KANO_LGAS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}</select>{err("lga")}</div>
        <div><label className="text-sm font-medium">State</label><input name="state" defaultValue="Kano" className="mt-1 w-full" /></div>
      </div>
      {officers.map(([k, l]) => (
        <div key={k} className="grid gap-3 sm:grid-cols-2">
          <div><label className="text-sm font-medium">{l} name</label><input name={`${k}Name`} className="mt-1 w-full" required />{err(`${k}Name`)}</div>
          <div><label className="text-sm font-medium">{l} phone</label><input name={`${k}Phone`} inputMode="tel" className="mt-1 w-full" required />{err(`${k}Phone`)}</div>
        </div>))}
      <button disabled={pending} className="w-full rounded-lg bg-[var(--brand)] py-3 font-semibold text-white hover:bg-[var(--brand-dark)]">{pending ? "Sending..." : "Submit application"}</button>
    </form>);
}
