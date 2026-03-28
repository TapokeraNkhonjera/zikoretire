import { PrismaClient, Role } from "@prisma/client";
import "dotenv/config";
import * as MariaDBAdapter from "@prisma/adapter-mariadb";
import bcrypt from "bcrypt";
console.log("DATABASE_URL:", process.env.DATABASE_URL);

async function main() {
  const adapter = new MariaDBAdapter.PrismaMariaDb(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@zikoretire.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
    {
      name: "Test User",
      email: "user@zikoretire.com",
      password: hashedPassword,
      role: Role.USER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Checked/Created user: ${user.email}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});