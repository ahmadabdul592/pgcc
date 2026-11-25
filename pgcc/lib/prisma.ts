import { PrismaClient } from "@prisma/client";

// Neon's free compute sleeps when idle; the first query can fail while it wakes up.
// Retry only "cannot reach database" errors (nothing was executed, so retrying is safe).
const RETRY = new Set(["P1001", "P1002", "P1017"]);

function make() {
  return new PrismaClient().$extends({
    query: {
      $allOperations: async ({ args, query }) => {
        for (let i = 0; ; i++) {
          try {
            return await query(args);
          } catch (e: any) {
            if (i >= 3 || !RETRY.has(e?.code)) throw e;
            await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
          }
        }
      },
    },
  });
}

const g = globalThis as unknown as { prisma?: ReturnType<typeof make> };
export const prisma = g.prisma ?? make();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
