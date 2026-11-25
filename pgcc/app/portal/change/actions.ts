"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { orgSchema } from "@/lib/createOrg";
import { currentValues } from "@/lib/changes";

const sch = orgSchema.pick({ name: true, level: true, address: true, lga: true, chairmanName: true, chairmanPhone: true, secretaryName: true, secretaryPhone: true, proName: true, proPhone: true, womenLeaderName: true, womenLeaderPhone: true });

export async function submitChange(_: unknown, fd: FormData) {
  const u = await requireRole(["ORG_LEADER"]);
  const orgId = u.organizationId!;
  const p = sch.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.flatten().fieldErrors as Record<string, string[]> };
  const cur = await currentValues(orgId);
  const diff: Record<string, string> = {};
  for (const [k, v] of Object.entries(p.data)) if (String(v).trim() !== cur[k]) diff[k] = String(v).trim();
  if (diff.chairmanPhone && (await prisma.user.findFirst({ where: { phone: diff.chairmanPhone, id: { not: u.id } } })))
    return { error: { chairmanPhone: ["This phone number is already used by another login."] } as Record<string, string[]> };
  if (!Object.keys(diff).length) return { error: { form: ["You have not changed anything."] } as Record<string, string[]> };
  await prisma.changeRequest.create({ data: { organizationId: orgId, payload: diff } });
  revalidatePath("/portal/change");
  return { ok: true as const };
}
