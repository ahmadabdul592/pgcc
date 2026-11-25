import Link from "next/link";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  async function action(fd: FormData) {
    "use server";
    try {
      await signIn("credentials", { identifier: fd.get("identifier"), password: fd.get("password"), redirect: false });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=1");
      throw e;
    }
    redirect("/admin"); // org leaders are sent on to /portal
  }
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <form action={action} className="w-full max-w-sm space-y-3 rounded-xl border border-(--line) bg-white p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-(--brand)"><img src="/apc.png" alt="" className="h-8 w-8" />Organization Database</Link>
        <h1 className="pt-2 text-xl font-bold">Sign in</h1>
        {error && <p role="alert" className="text-sm text-red-700">Wrong phone, email or password.</p>}
        <div><label htmlFor="identifier" className="text-sm font-medium">Phone or email</label><input id="identifier" name="identifier" className="mt-1 w-full" required /></div>
        <div><label htmlFor="password" className="text-sm font-medium">Password</label><input id="password" name="password" type="password" className="mt-1 w-full" required /></div>
        <button className="w-full rounded-lg bg-(--brand) py-2.5 font-semibold text-white hover:bg-(--brand-dark)">Login</button>
        <Link href="/forgot-password" className="block text-center text-sm underline">Forgot password?</Link>
      </form>
    </main>);
}
