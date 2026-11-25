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
      if (e instanceof AuthError) {
        const kind = (e as any).code === "rate_limited" ? "locked" : e.type === "CredentialsSignin" ? "1" : "server";
        if (kind === "server") console.error("Login error:", (e as any).cause ?? e); // shows the real cause in the terminal
        redirect(`/login?error=${kind}`);
      }
      throw e;
    }
    redirect("/admin"); // org leaders are sent on to /portal
  }
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <form action={action} className="w-full max-w-sm space-y-3 rounded-xl border border-(--line) bg-white p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-(--brand)"><img src="/apc.png" alt="" className="h-8 w-8" />Organization Database</Link>
        <h1 className="pt-2 text-xl font-bold">Sign in</h1>
        {error && <p role="alert" className="text-sm text-red-700">{error === "locked" ? "Too many attempts. Try again in 15 minutes." : error === "server" ? "Could not sign in because of a server problem. Please try again." : "Wrong phone, email or password."}</p>}
        <div><label htmlFor="identifier" className="text-sm font-medium">Phone or email</label><input id="identifier" name="identifier" className="mt-1 w-full" required /></div>
        <div><label htmlFor="password" className="text-sm font-medium">Password</label><input id="password" name="password" type="password" className="mt-1 w-full" required /></div>
        <button className="w-full rounded-lg bg-(--brand) py-2.5 font-semibold text-white hover:bg-(--brand-dark)">Login</button>
        <Link href="/forgot-password" className="block text-center text-sm underline">Forgot password?</Link>
      </form>
    </main>);
}
