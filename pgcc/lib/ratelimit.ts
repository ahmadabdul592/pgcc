import { prisma } from "./prisma";

/** Fixed-window limiter backed by the database (works on serverless). Returns false when over the limit. */
export async function allow(key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSec * 1000);
  const r = await prisma.rateLimit.findUnique({ where: { key } });
  if (!r || r.resetAt < now) {
    await prisma.rateLimit.upsert({ where: { key }, update: { count: 1, resetAt }, create: { key, count: 1, resetAt } });
    return true;
  }
  if (r.count >= limit) return false;
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
