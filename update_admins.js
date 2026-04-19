const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting data correction...');

  // 1. Find all users with their current campusId (before we lose it or if it's still there)
  // Note: This script should be run BEFORE deleting the campusId column if possible,
  // or we use a raw query if the column is already gone but data is still in DB.
  
  try {
    const users = await prisma.$queryRaw`SELECT id, role, "campusId" FROM users`;
    
    for (const user of users) {
      if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        console.log(`Clearing campus for admin ${user.id}`);
        // Admins should have NO campuses
        await prisma.$executeRaw`DELETE FROM "_CampusToUser" WHERE "B" = ${user.id}`;
      } else if (user.campusId) {
        console.log(`Migrating campus ${user.campusId} for user ${user.id} (${user.role})`);
        // Connect the existing campusId to the new relation
        await prisma.user.update({
          where: { id: user.id },
          data: {
            campuses: {
              connect: { id: user.campusId }
            }
          }
        });
      }
    }
    
    console.log('Correction completed successfully.');
  } catch (error) {
    console.error('Error during correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
