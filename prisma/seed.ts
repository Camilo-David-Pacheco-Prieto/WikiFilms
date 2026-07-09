import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = "admin";
  const existing = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existing) {
    console.log("El usuario admin ya existe.");
    return;
  }

  const password = await bcrypt.hash("admin123", 12);

  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@wikifilms.com",
      username: adminUsername,
      password,
      role: "ADMIN",
    },
  });

  console.log("Usuario admin creado: admin / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
