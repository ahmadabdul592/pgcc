const { PrismaClient } = require("@prisma/client");
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email) throw new Error("SEED_ADMIN_EMAIL is required");
  if (!password) throw new Error("SEED_ADMIN_PASSWORD is required");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Super Admin", role: "SUPER_ADMIN", passwordHash },
  });
  console.log("Seeded super admin:", email);
}
main().finally(() => prisma.$disconnect());
