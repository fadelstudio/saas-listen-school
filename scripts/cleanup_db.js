const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Schools ---');
  const schools = await prisma.school.findMany();
  for (const school of schools) {
    console.log(`ID: [${school.id}], Slug: [${school.slug}], Name: [${school.name}]`);
    
    if (school.id.includes('\n') || school.slug.includes('\n')) {
      const cleanId = school.id.trim();
      const cleanSlug = school.slug.trim();
      console.log(`Fixing school: ${school.id} -> ${cleanId}`);
      
      // Since ID is a primary key, we might need to be careful.
      // But for now let's just see.
    }
  }
  
  console.log('--- Checking Users ---');
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { schoolId: { contains: '\n' } }
      ]
    }
  });
  console.log(`Found ${users.length} users with newline in schoolId`);
  for (const user of users) {
    const cleanSchoolId = user.schoolId.trim();
    console.log(`Fixing user ${user.email}: ${user.schoolId} -> ${cleanSchoolId}`);
    await prisma.user.update({
      where: { id: user.id },
      data: { schoolId: cleanSchoolId }
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
