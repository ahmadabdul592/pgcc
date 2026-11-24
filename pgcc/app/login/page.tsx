import Link from "next/link";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const errorMessage =
    error === "credentials" || error === "1"
      ? "Wrong phone, email or password."
      : error === "unavailable"
        ? "We couldn't sign you in because the service is temporarily unavailable. Please try again."
        : null;

  async function action(fd: FormData) {
    "use server";
    try {
      await signIn("credentials", { identifier: fd.get("identifier"), password: fd.get("password"), redirect: false });
    } catch (e) {
      if (e instanceof AuthError && e.type === "CredentialsSignin") redirect("/login?error=credentials");
      if (e instanceof AuthError && e.type === "CallbackRouteError") redirect("/login?error=unavailable");
      throw e;
    }
    redirect("/admin/organizations"); // org leaders are sent on to /portal
  }
  return (
    <main className="auth-background grid min-h-screen place-items-center p-4 sm:p-6">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl border border-(--line) bg-white p-5 shadow-xl shadow-emerald-950/5 sm:p-7">
        <Link href="/" className="flex items-center gap-2 font-bold text-(--brand)"><img src="/apc.png" alt="" className="h-8 w-8" />Organization Database</Link>
        <h1 className="pt-2 text-xl font-bold">Sign in</h1>
        {errorMessage && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{errorMessage}</p>}
        <div><label htmlFor="identifier" className="text-sm font-medium">Phone or email</label><input id="identifier" name="identifier" className="mt-1 w-full" required /></div>
        <div><label htmlFor="password" className="text-sm font-medium">Password</label><input id="password" name="password" type="password" className="mt-1 w-full" required /></div>
        <button className="w-full rounded-lg bg-(--brand) py-2.5 font-semibold text-white hover:bg-(--brand-dark)">Login</button>
        <Link href="/forgot-password" className="block text-center text-sm underline">Forgot password?</Link>
      </form>
    </main>);
}
