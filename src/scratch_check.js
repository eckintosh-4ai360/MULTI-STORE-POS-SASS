const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const storeCount = await prisma.store.count();
  const userCount = await prisma.user.count();
  console.log("Store count in DB:", storeCount);
  console.log("User count in DB:", userCount);

  if (userCount > 0) {
    const users = await prisma.user.findMany();
    console.log("Users in DB:");
    console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status })));
  } else {
    console.log("No users found in the database!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
