"use client";
import { useActionState } from "react";
import { createOrganization } from "../actions";
import { KANO_LGAS } from "@/lib/kano-lgas";

const inp = "border rounded px-3 py-2 w-full";
const officers = [["chairman", "Chairman"], ["secretary", "Secretary"], ["pro", "P.R.O"], ["womenLeader", "Women Leader"]];

export default function NewOrg() {
  const [s, action, pending] = useActionState(createOrganization, null as any);
  const err = (k: string) => s?.error?.[k] && <p className="text-sm text-red-600">{s.error[k][0]}</p>;
  if (s?.ok) return (
    <main className="mx-auto max-w-lg p-5 md:p-8">
      <h1 className="text-xl font-semibold text-green-700">Organisation created</h1>
      <div className="mt-4 rounded border bg-green-50 p-4 space-y-1">
        <p>Reg No: <b>{s.regNo}</b></p><p>Login phone: <b>{s.loginPhone}</b></p>
        <p>Temporary password: <b>{s.tempPassword}</b></p>
        <p className="text-sm text-red-600">Copy this now. It will not be shown again.</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3"><a href={`/admin/organizations/${s.slug}`} className="rounded-lg bg-(--brand) px-5 py-2.5 font-semibold text-white">View organisation</a><a href="/admin/organizations/new" className="rounded-lg border px-5 py-2.5">Add another</a><a href="/admin/organizations" className="rounded-lg border px-5 py-2.5">Back to list</a></div>
    </main>);
  return (
    <main className="mx-auto max-w-2xl space-y-3 p-5 md:p-8">
      <h1 className="text-2xl font-semibold">New organisation</h1>
      <form action={action} className="space-y-3">
        <input name="name" placeholder="Name of support group" className={inp} required />{err("name")}
        <div className="grid grid-cols-2 gap-3">
          <input name="dateEstablished" type="date" className={inp} />
          <select name="level" className={inp}><option>NATIONAL</option><option>STATE</option><option>LGA</option><option>WARD</option></select>
        </div>
        <input name="address" placeholder="Address" className={inp} required />{err("address")}
        <div className="grid grid-cols-2 gap-3">
          <select name="lga" className={inp} required defaultValue=""><option value="" disabled>Select local government</option>{KANO_LGAS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}</select><input name="state" defaultValue="Kano" className={inp} />
        </div>
        {officers.map(([k, label]) => (
          <div key={k} className="grid grid-cols-2 gap-3">
            <div><input name={`${k}Name`} placeholder={`${label} name`} className={inp} required />{err(`${k}Name`)}</div>
            <div><input name={`${k}Phone`} placeholder={`${label} phone`} className={inp} required />{err(`${k}Phone`)}</div>
          </div>))}
        <button disabled={pending} className="rounded bg-green-700 px-5 py-2 text-white">{pending ? "Saving..." : "Create"}</button>
      </form>
    </main>);
}
