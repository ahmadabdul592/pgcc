"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

/** Passport photo is optional and can be changed any time. Stored as a small resized JPEG. */
export async function updateMemberPhoto(memberId: string, dataUrl: string) {
  const u = await requireRole(["SUPER_ADMIN", "STATE_ADMIN", "LGA_COORDINATOR", "ORG_LEADER"]);
  if (!dataUrl.startsWith("data:image/jpeg;base64,") || dataUrl.length > 120_000) return { error: "Photo is not valid or too large." };
  const m = await prisma.member.findUniqueOrThrow({ where: { id: memberId } });
  if (u.role === "ORG_LEADER" && m.organizationId !== u.organizationId) throw new Error("FORBIDDEN");
  await prisma.member.update({ where: { id: memberId }, data: { photoUrl: dataUrl } });
  revalidatePath("/portal");
  return { ok: true };
}
