import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count({
    where: {
      role: 'STUDENT',
      classId: null
    }
  });
  console.log(`Students without class: ${count}`);
  
  const sample = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      classId: null
    },
    take: 5,
    select: { email: true, firstName: true, lastName: true }
  });
  console.log('Sample:', JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
