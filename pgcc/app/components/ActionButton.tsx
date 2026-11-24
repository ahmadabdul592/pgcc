"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Res = { message?: string; error?: string };
export default function ActionButton({ label, run, danger, confirm }: { label: string; run: () => Promise<Res>; danger?: boolean; confirm?: string }) {
  const [res, setRes] = useState<Res | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (res) return (
    <div className="rounded-lg border border-[var(--gold)] bg-yellow-50 p-3 text-sm">
      <p className={`whitespace-pre-line ${res.error ? "text-red-700" : ""}`}>{res.error ?? res.message}</p>
      <button className="mt-2 font-semibold underline" onClick={() => router.refresh()}>Done</button>
    </div>);
  return (
    <button disabled={pending} onClick={() => { if (confirm && !window.confirm(confirm)) return; start(async () => setRes(await run())); }}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${danger ? "border border-red-600 text-red-700" : "bg-[var(--brand)] text-white"}`}>
      {pending ? "Working..." : label}</button>);
}
