import "next-auth";
declare module "next-auth" {
  interface User { role?: string; organizationId?: string | null; lgaId?: string | null }
}
