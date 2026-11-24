import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default function Login() {
  async function action(fd: FormData) {
    "use server";
    try {
      await signIn("credentials", { identifier: fd.get("identifier"), password: fd.get("password"), redirect: false });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=1");
      throw e;
    }
    redirect("/admin/organizations"); // org leaders are bounced to /portal by the admin layout
  }
  return (
    <main className="min-h-screen grid place-items-center">
      <form action={action} className="w-80 space-y-3 border rounded-lg p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <input name="identifier" placeholder="Email or phone" className="border rounded w-full px-3 py-2" required />
        <input name="password" type="password" placeholder="Password" className="border rounded w-full px-3 py-2" required />
        <button className="w-full rounded bg-green-700 text-white py-2">Login</button>
      </form>
    </main>
  );
}
