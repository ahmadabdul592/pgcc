"use client";
export default function PrintButton() {
  return <button onClick={() => window.print()} className="rounded-lg bg-[var(--brand)] px-5 py-2.5 font-semibold text-white print:hidden">Print / Save as PDF</button>;
}
