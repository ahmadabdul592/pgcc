import Link from "next/link";
import ApplyForm from "./ApplyForm";

export default function Apply() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white"><div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--brand)]"><img src="/apc.png" alt="" className="h-9 w-9" />Organization Database</Link></div></header>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-5 sm:py-10">
        <div><h1 className="page-heading font-bold">Register your support group</h1>
          <p className="mt-2 text-[var(--muted)]">Fill in your group details. The Directorate reviews every application before issuing login details.</p></div>
        <ApplyForm />
      </div>
    </main>);
}
