import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/duplicates";

export default async function Forgot({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  async function submit(fd: FormData) {
    "use server";
    const id = String(fd.get("identifier") ?? "").trim().slice(0, 100);
    const phone = normalizePhone(id);
    const user = id ? await prisma.user.findFirst({ where: { active: true, role: { not: "SUPER_ADMIN" }, OR: [{ email: id.toLowerCase() }, ...(phone ? [{ phone }] : [])] } }) : null;
    if (user && !(await prisma.resetRequest.findFirst({ where: { userId: user.id, status: "PENDING" } })))
      await prisma.resetRequest.create({ data: { identifier: id, userId: user.id } });
    redirect("/forgot-password?sent=1"); // same answer whether or not the account exists
  }
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--brand)]"><img src="/apc.png" alt="" className="h-8 w-8" />Organization Database</Link>
        <h1 className="mt-4 text-xl font-bold">Forgot password</h1>
        {sent ? <p className="mt-3 text-sm">Request sent. If the account exists, the Directorate will contact you with a temporary password.</p> : (
          <form action={submit} className="mt-3 space-y-3">
            <label htmlFor="identifier" className="text-sm font-medium">Your login phone or email</label>
            <input id="identifier" name="identifier" className="w-full" required />
            <button className="w-full rounded-lg bg-[var(--brand)] py-2.5 font-semibold text-white">Send request</button>
          </form>)}
        <Link href="/login" className="mt-4 block text-sm underline">Back to login</Link>
      </div>
    </main>);
}
