import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { currentValues, label } from "@/lib/changes";
import ChangeForm from "./ChangeForm";

export default async function Change() {
  const u = await requireRole(["ORG_LEADER"]);
  const [cur, past] = await Promise.all([
    currentValues(u.organizationId!),
    prisma.changeRequest.findMany({ where: { organizationId: u.organizationId! }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-5 md:p-8">
      <h1 className="text-2xl font-bold">Edit group details</h1>
      <p className="text-sm text-[var(--muted)]">Change what is needed and send it. The Directorate reviews each request, and your profile updates only after approval. You can send more than one request.</p>
      <ChangeForm cur={cur} />
      {past.length > 0 && <section><h2 className="font-bold">Your requests</h2>
        <ul className="mt-2 text-sm">{past.map((r) => <li key={r.id}>{r.createdAt.toLocaleDateString("en-GB")} · {Object.keys(r.payload as object).map(label).join(", ")} · <b>{r.status.toLowerCase()}</b></li>)}</ul></section>}
    </main>);
}
