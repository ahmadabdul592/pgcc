"use client";
import { useActionState } from "react";
import { addMemberAction, importCsvAction } from "./actions";

const inp = "border rounded px-3 py-2";
export default function MemberForms() {
  const [a, addAct, p1] = useActionState(addMemberAction, null as any);
  const [c, csvAct, p2] = useActionState(importCsvAction, null as any);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={addAct} className="space-y-2 rounded border p-4">
        <h3 className="font-semibold">Add a member</h3>
        <input name="name" placeholder="Full name" className={`${inp} w-full`} required />
        <input name="phone" placeholder="Phone (080...)" className={`${inp} w-full`} required />
        <div className="grid grid-cols-2 gap-2"><input name="ward" placeholder="Ward" className={inp} required /><input name="pollingUnit" placeholder="Polling unit" className={inp} required /></div>
        <input name="position" placeholder="Position (default: Member)" className={`${inp} w-full`} />
        <label className="flex gap-2 text-sm"><input type="checkbox" name="consent" required /> Member consented to be listed</label>
        <button disabled={p1} className="rounded bg-green-700 px-4 py-2 text-white">Add</button>
        {a && !a.ok && <p className="text-sm text-red-600">{a.message}</p>}
        {a?.ok && <p className="text-sm text-green-700">Added.{a.flagged.length > 0 && <span className="text-amber-600"> Note: this person also appears in another group; the Directorate will review.</span>}</p>}
      </form>
      <form action={csvAct} className="space-y-2 rounded border p-4">
        <h3 className="font-semibold">Upload CSV</h3>
        <p className="text-sm text-gray-600">Columns: name, phone, ward, polling unit, position</p>
        <input type="file" name="file" accept=".csv" required />
        <label className="flex gap-2 text-sm"><input type="checkbox" name="consent" /> All listed members consented</label>
        <button disabled={p2} className="rounded bg-green-700 px-4 py-2 text-white">{p2 ? "Uploading..." : "Upload"}</button>
        {c?.error && <p className="text-sm text-red-600">{c.error}</p>}
        {c?.report && <div className="text-sm"><p>Added: <b>{c.report.added}</b> · Flagged: <b>{c.report.flagged}</b> · Rejected: <b>{c.report.rejected.length}</b></p>
          {c.report.rejected.slice(0, 10).map((r: any) => <p key={r.row} className="text-red-600">Row {r.row}: {r.message}</p>)}</div>}
      </form>
    </div>);
}
