import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const schoolId = 'afi';
  
  // 1. Find a fallback class for 'afi'
  const fallbackClass = await prisma.class.findFirst({
    where: { campus: { schoolId } }
  });
  
  if (!fallbackClass) {
    console.log('No class found for school "afi". Please create one first or provide an ID.');
    return;
  }
  
  console.log(`Using fallback class: ${fallbackClass.name} (${fallbackClass.id})`);
  
  // 2. Update students without classId or schoolId
  const result = await prisma.user.updateMany({
    where: {
      role: 'STUDENT',
      OR: [
        { classId: null },
        { schoolId: null }
      ]
    },
    data: {
      schoolId: schoolId,
      classId: fallbackClass.id
    }
  });
  
  console.log(`Updated ${result.count} students.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
