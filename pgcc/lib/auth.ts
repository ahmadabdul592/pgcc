import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { normalizePhone } from "./duplicates";

// Login with email (admins) or phone (org leaders) + password.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { identifier: {}, password: {} },
      async authorize(c) {
        const id = String(c?.identifier ?? "").trim();
        const pw = String(c?.password ?? "");
        const phone = normalizePhone(id);
        const user = await prisma.user.findFirst({
          where: { active: true, OR: [{ email: id.toLowerCase() }, ...(phone ? [{ phone }] : [])] },
        });
        if (!user || !(await bcrypt.compare(pw, user.passwordHash))) return null;
        return {
          id: user.id, name: user.name, role: user.role,
          organizationId: user.organizationId, lgaId: user.lgaId,
        } as any;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) Object.assign(token, { role: (user as any).role, organizationId: (user as any).organizationId, lgaId: (user as any).lgaId });
      return token;
    },
    session({ session, token }) {
      Object.assign(session.user, { id: token.sub, role: token.role, organizationId: token.organizationId, lgaId: token.lgaId });
      return session;
    },
  },
});

export type Role = "SUPER_ADMIN" | "STATE_ADMIN" | "LGA_COORDINATOR" | "ORG_LEADER";

/** Use at the top of any server action / admin page. */
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  const u = session?.user as any;
  if (!u || !allowed.includes(u.role)) throw new Error("FORBIDDEN");
  return u as { id: string; role: Role; organizationId?: string; lgaId?: string };
}
