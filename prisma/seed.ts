import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
      { firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com' }
    ]
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());