import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcrypt';
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Campus
  const campusDakar = await prisma.campus.upsert({
    where: { name: 'Campus Dakar' },
    update: {},
    create: {
      name: 'Campus Dakar',
      location: 'Dakar, Sénégal',
    },
  });

  await prisma.campus.upsert({
    where: { name: 'Campus Abidjan' },
    update: {},
    create: {
      name: 'Campus Abidjan',
      location: 'Abidjan, Côte d\'Ivoire',
    },
  });

  console.log('✅ Campuses created');

  // 2. Create Academic Levels (Dynamic)
  await prisma.academicLevel.upsert({
    where: { name: 'L1' },
    update: {},
    create: { name: 'L1', order: 1 },
  });
  await prisma.academicLevel.upsert({
    where: { name: 'L2' },
    update: {},
    create: { name: 'L2', order: 2 },
  });
  const levelL3 = await prisma.academicLevel.upsert({
    where: { name: 'L3' },
    update: {},
    create: { name: 'L3', order: 3 },
  });
  const levelM1 = await prisma.academicLevel.upsert({
    where: { name: 'M1' },
    update: {},
    create: { name: 'Master 1', order: 4 },
  });
  const levelFC = await prisma.academicLevel.upsert({
    where: { name: 'Formation Continue' },
    update: {},
    create: { name: 'Formation Continue', order: 5 },
  });

  console.log('✅ Academic Levels created');

  // 3. Create Classes
  await prisma.class.upsert({
    where: { id: 'class-l3-info' },
    update: { levelId: levelL3.id },
    create: {
      id: 'class-l3-info',
      name: 'L3 Informatique',
      levelId: levelL3.id,
      campusId: campusDakar.id,
    },
  });

  await prisma.class.upsert({
    where: { id: 'class-m1-mkt' },
    update: { levelId: levelM1.id },
    create: {
      id: 'class-m1-mkt',
      name: 'M1 Marketing',
      levelId: levelM1.id,
      campusId: campusDakar.id,
    },
  });

  await prisma.class.upsert({
    where: { id: 'class-fc-mgmt' },
    update: { levelId: levelFC.id },
    create: {
      id: 'class-fc-mgmt',
      name: 'Management (FC)',
      levelId: levelFC.id,
      campusId: campusDakar.id,
    },
  });

  console.log('✅ Classes created linked to AcademicLevels');

  // 4. Create Professors
  const profDiallo = await prisma.professor.upsert({
    where: { email: 'diallo@afi.com' },
    update: { campusId: campusDakar.id },
    create: {
      firstName: 'Ibrahima',
      lastName: 'Diallo',
      email: 'diallo@afi.com',
      campusId: campusDakar.id,
    },
  });

  const profTraore = await prisma.professor.upsert({
    where: { email: 'traore@afi.com' },
    update: { campusId: campusDakar.id },
    create: {
      firstName: 'Mariam',
      lastName: 'Traoré',
      email: 'traore@afi.com',
      campusId: campusDakar.id,
    },
  });

  console.log('✅ Professors created');

  // 5. Create Global Modules
  const modAlgo = await prisma.module.upsert({
    where: { name: 'Algorithmique & Structure de données' },
    update: {},
    create: {
      name: 'Algorithmique & Structure de données',
      code: 'INF-ALGO',
    },
  });

  const modDB = await prisma.module.upsert({
    where: { name: 'Base de données' },
    update: {},
    create: {
      name: 'Base de données',
      code: 'INF-DB',
    },
  });

  const modMkt = await prisma.module.upsert({
    where: { name: 'Stratégie Digitale' },
    update: {},
    create: {
      name: 'Stratégie Digitale',
      code: 'MKT-STRAT',
    },
  });

  console.log('✅ Global Modules created');

  // 6. Create Assignments (ClassModule)
  // L3 Informatique Assignments
  await prisma.classModule.create({
    data: {
      classId: 'class-l3-info',
      moduleId: modAlgo.id,
      professors: { connect: [{ id: profDiallo.id }] }
    }
  });

  await prisma.classModule.create({
    data: {
      classId: 'class-l3-info',
      moduleId: modDB.id,
      professors: { connect: [{ id: profDiallo.id }, { id: profTraore.id }] }
    }
  });

  // M1 Marketing Assignments
  await prisma.classModule.create({
    data: {
      classId: 'class-m1-mkt',
      moduleId: modMkt.id,
      professors: { connect: [{ id: profTraore.id }] }
    }
  });

  console.log('✅ Assignments (ClassModule) created');

  // 5. Create Default SuperAdmin & Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const superPassword = await bcrypt.hash('fadeldev', 12);

  await prisma.user.upsert({
    where: { email: 'superadmin@saas.com' },
    update: {
      matricule: 'SUPER-001',
      isActive: true
    },
    create: {
      email: 'superadmin@saas.com',
      passwordHash: superPassword,
      firstName: 'SaaS',
      lastName: 'SuperAdmin',
      role: Role.SUPERADMIN,
      isActive: true,
      matricule: 'SUPER-001'
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@afi.com' },
    update: {
      campusId: campusDakar.id,
      matricule: 'ADM-AFI-001',
      isActive: true
    },
    create: {
      email: 'admin@afi.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'AFI',
      role: Role.ADMIN,
      isActive: true,
      campusId: campusDakar.id,
      matricule: 'ADM-AFI-001'
    },
  });

  console.log('✅ Users created (Superadmin: superadmin@saas.com / Admin: admin@afi.com)');
  
  // 6. Create Default System Settings (Flexible AI)
  await prisma.systemSettings.upsert({
    where: { id: 'default-settings' },
    update: {
      aiConfigs: [
        { id: 'config-gemini', name: 'Gemini Pro (Ultra)', provider: 'GEMINI', model: 'gemini-pro', apiKey: process.env.GEMINI_API_KEY, priority: 1, isFree: false },
        { id: 'config-openai', name: 'OpenAI GPT-4o', provider: 'OPENAI', model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY, priority: 2, isFree: false },
        { id: 'config-groq', name: 'Groq Llama3 (Fast)', provider: 'GROQ', model: 'llama3-8b-8192', apiKey: process.env.GROQ_API_KEY, priority: 3, isFree: false },
        { id: 'config-free', name: 'Gemini Flash (Gratuit)', provider: 'GEMINI', model: 'gemini-1.5-flash', apiKey: process.env.GEMINI_API_KEY, priority: 10, isFree: true }
      ]
    },
    create: {
      id: 'default-settings',
      schoolName: 'AFI',
      authReportsRequired: false,
      authEvaluationsRequired: false,
      aiEnabled: true,
      aiConfigs: [
        { id: 'config-gemini', name: 'Gemini Pro (Ultra)', provider: 'GEMINI', model: 'gemini-pro', apiKey: process.env.GEMINI_API_KEY, priority: 1, isFree: false },
        { id: 'config-openai', name: 'OpenAI GPT-4o', provider: 'OPENAI', model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY, priority: 2, isFree: false },
        { id: 'config-groq', name: 'Groq Llama3 (Fast)', provider: 'GROQ', model: 'llama3-8b-8192', apiKey: process.env.GROQ_API_KEY, priority: 3, isFree: false },
        { id: 'config-free', name: 'Gemini Flash (Gratuit)', provider: 'GEMINI', model: 'gemini-1.5-flash', apiKey: process.env.GEMINI_API_KEY, priority: 10, isFree: true }
      ]
    },
  });

  console.log('✅ Default SystemSettings created');

  console.log('✨ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
