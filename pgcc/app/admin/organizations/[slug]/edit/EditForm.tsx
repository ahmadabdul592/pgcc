"use client";
import { useActionState } from "react";
import { updateOrgFull } from "../../edit-actions";

const officers = [["chairman", "Chairman"], ["secretary", "Secretary"], ["pro", "P.R.O"], ["womenLeader", "Women Leader"]];

export default function EditForm({ id, v }: { id: string; v: Record<string, string> }) {
  const [s, action, pending] = useActionState(updateOrgFull, null as any);
  const err = (k: string) => s?.error?.[k] && <p role="alert" className="text-sm text-red-700">{s.error[k][0]}</p>;
  const f = (k: string, l: string, extra = {}) => (
    <div><label htmlFor={k} className="text-sm font-medium">{l}</label><input id={k} name={k} defaultValue={v[k]} className="mt-1 w-full" required {...extra} />{err(k)}</div>);
  return (
    <form action={action} className="space-y-4 rounded-xl border border-[var(--line)] bg-white p-5">
      <input type="hidden" name="orgId" value={id} />
      {f("name", "Name of support group")}
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label htmlFor="dateEstablished" className="text-sm font-medium">Date established</label><input id="dateEstablished" name="dateEstablished" type="date" defaultValue={v.dateEstablished} className="mt-1 w-full" /></div>
        <div><label htmlFor="level" className="text-sm font-medium">Level</label><select id="level" name="level" defaultValue={v.level} className="mt-1 w-full">{["NATIONAL", "STATE", "LGA", "WARD"].map((l) => <option key={l}>{l}</option>)}</select></div>
      </div>
      {f("address", "Address")}
      <div className="grid gap-3 sm:grid-cols-2">{f("lga", "L.G.A")}{f("state", "State")}</div>
      {officers.map(([k, l]) => <div key={k} className="grid gap-3 sm:grid-cols-2">{f(`${k}Name`, `${l} name`)}{f(`${k}Phone`, `${l} phone`)}</div>)}
      <div className="flex gap-3">
        <button disabled={pending} className="rounded-lg bg-[var(--brand)] px-6 py-2.5 font-semibold text-white">{pending ? "Saving..." : "Save changes"}</button>
        <a href="javascript:history.back()" className="rounded-lg border px-6 py-2.5">Cancel</a>
      </div>
    </form>);
}
