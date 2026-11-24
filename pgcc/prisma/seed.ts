import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Super Admin", role: "SUPER_ADMIN", passwordHash: await bcrypt.hash(password, 10) },
  });
  console.log("Seeded super admin:", email);
}
main().finally(() => prisma.$disconnect());
