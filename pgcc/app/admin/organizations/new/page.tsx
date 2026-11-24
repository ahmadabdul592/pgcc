import Link from "next/link";
import { requireRole } from "@/lib/auth";
import NewOrganizationForm from "./new-organization-form";

export default async function NewOrganization() {
  await requireRole(["SUPER_ADMIN", "STATE_ADMIN"]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin/organizations" className="underline">Back to organisations</Link>
      <h1 className="mb-6 mt-4 text-2xl font-semibold">New organisation</h1>
      <NewOrganizationForm />
    </main>
  );
}
