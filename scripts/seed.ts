import bcryptjs from "bcryptjs";
import prisma from "../src/lib/prisma";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@school.com" } });
  if (!existing) {
    const hashed = await bcryptjs.hash("123456", 12);
    await prisma.user.create({
      data: { name: "المشرف العام", email: "admin@school.com", password: hashed, role: "ADMIN" },
    });
    console.log("✅ Admin user created: admin@school.com / 123456");
  } else {
    console.log("ℹ️  Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());