
import { prisma } from '../src/core/database/prisma';

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@afi.com' } });
  console.log('User found:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

check();
