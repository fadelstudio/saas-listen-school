import { systemService } from './src/modules/system/system.service';
import { prisma } from './src/core/database/prisma';

async function test() {
  try {
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('No school found');
      return;
    }
    const data = await systemService.getPublicFormData(school.id);
    console.log('Professors with targetClassIds:');
    console.log(JSON.stringify(data.professors.slice(0, 2), null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
