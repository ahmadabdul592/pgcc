"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { orgSchema } from "@/lib/createOrg";

const schema = orgSchema.extend({ email: z.string().email("Enter a valid email") });

export async function submitApplication(_: unknown, fd: FormData) {
  if (fd.get("website")) return { ok: true as const }; // honeypot: bots fill this hidden field
  const p = schema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.flatten().fieldErrors as Record<string, string[]> };
  const email = p.data.email.toLowerCase();
  if (await prisma.application.findFirst({ where: { email, status: "PENDING" } }))
    return { error: { email: ["An application with this email is already waiting for review."] } as Record<string, string[]> };
  await prisma.application.create({ data: { email, payload: { ...p.data, email } } });
  return { ok: true as const };
}
