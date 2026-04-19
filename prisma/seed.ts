import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_SCHOOL_ID = 'afi-default-school';

async function main() {
  console.log('🌱 Starting database seeding (Idempotent)...');

  await prisma.school.upsert({
    where: { id: DEFAULT_SCHOOL_ID },
    update: {},
    create: {
      id: DEFAULT_SCHOOL_ID,
      name: 'AFI (default)',
      slug: 'afi-default-school',
    },
  });

  const campusDakar = await prisma.campus.upsert({
    where: { name: 'Campus Dakar' },
    update: { schoolId: DEFAULT_SCHOOL_ID },
    create: {
      name: 'Campus Dakar',
      location: 'Dakar, Sénégal',
      schoolId: DEFAULT_SCHOOL_ID,
    },
  });

  await prisma.campus.upsert({
    where: { name: 'Campus Abidjan' },
    update: { schoolId: DEFAULT_SCHOOL_ID },
    create: {
      name: 'Campus Abidjan',
      location: "Abidjan, Côte d'Ivoire",
      schoolId: DEFAULT_SCHOOL_ID,
    },
  });

  console.log('✅ School + campuses');

  const levels = [
    { name: 'L1', order: 1 },
    { name: 'L2', order: 2 },
    { name: 'L3', order: 3 },
    { name: 'M1', order: 4 },
    { name: 'Formation Continue', order: 5 },
  ];

  const levelMap: Record<string, string> = {};
  for (const l of levels) {
    const level = await prisma.academicLevel.upsert({
      where: { schoolId_name: { schoolId: DEFAULT_SCHOOL_ID, name: l.name } },
      update: { order: l.order },
      create: { schoolId: DEFAULT_SCHOOL_ID, name: l.name, order: l.order },
    });
    levelMap[l.name] = level.id;
  }

  console.log('✅ Academic levels (scoped school)');

  const classes = [
    { id: 'class-l3-info', name: 'L3 Informatique', level: 'L3', campus: campusDakar.id },
    { id: 'class-m1-mkt', name: 'M1 Marketing', level: 'M1', campus: campusDakar.id },
    { id: 'class-fc-mgmt', name: 'Management (FC)', level: 'Formation Continue', campus: campusDakar.id },
  ];

  for (const c of classes) {
    await prisma.class.upsert({
      where: { id: c.id },
      update: { levelId: levelMap[c.level] },
      create: {
        id: c.id,
        name: c.name,
        levelId: levelMap[c.level],
        campusId: c.campus,
      },
    });
  }

  console.log('✅ Classes');

  const professors = [
    { email: 'diallo@afi.com', first: 'Ibrahima', last: 'Diallo' },
    { email: 'traore@afi.com', first: 'Mariam', last: 'Traoré' },
    { email: 'diop@afi.com', first: 'Cheikh', last: 'Diop' },
  ];

  const profIds: Record<string, string> = {};
  for (const p of professors) {
    const prof = await prisma.professor.upsert({
      where: { email: p.email },
      update: { campusId: campusDakar.id },
      create: {
        firstName: p.first,
        lastName: p.last,
        email: p.email,
        campusId: campusDakar.id,
      },
    });
    profIds[p.email] = prof.id;
  }

  console.log('✅ Professors');

  const modules = [
    { name: 'Algorithmique & Structure de données', code: 'INF-ALGO' },
    { name: 'Base de données', code: 'INF-DB' },
    { name: 'Stratégie Digitale', code: 'MKT-STRAT' },
  ];

  const modIds: Record<string, string> = {};
  for (const m of modules) {
    const mod = await prisma.module.upsert({
      where: { schoolId_name: { schoolId: DEFAULT_SCHOOL_ID, name: m.name } },
      update: { code: m.code },
      create: { schoolId: DEFAULT_SCHOOL_ID, name: m.name, code: m.code },
    });
    modIds[m.name] = mod.id;
  }

  console.log('✅ Modules (scoped school)');

  const assignments = [
    { classId: 'class-l3-info', modName: 'Algorithmique & Structure de données', profs: ['diallo@afi.com'] },
    { classId: 'class-l3-info', modName: 'Base de données', profs: ['diallo@afi.com', 'traore@afi.com'] },
    { classId: 'class-m1-mkt', modName: 'Stratégie Digitale', profs: ['traore@afi.com'] },
  ];

  for (const a of assignments) {
    const modId = modIds[a.modName];
    const existingAssignment = await prisma.classModule.findUnique({
      where: { classId_moduleId: { classId: a.classId, moduleId: modId } },
    });

    if (!existingAssignment) {
      await prisma.classModule.create({
        data: {
          classId: a.classId,
          moduleId: modId,
          professors: { connect: a.profs.map((email) => ({ id: profIds[email] })) },
        },
      });
    } else {
      await prisma.classModule.update({
        where: { id: existingAssignment.id },
        data: { professors: { set: a.profs.map((email) => ({ id: profIds[email] })) } },
      });
    }
  }

  console.log('✅ Class modules');

  const passwordHash = await bcrypt.hash('fadeldev', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);

  const users = [
    { email: 'superadmin@saas.com', role: Role.SUPERADMIN, mat: 'SUPER-001', first: 'SaaS', last: 'SuperAdmin', class: null as string | null },
    { email: 'admin@afi.com', role: Role.ADMIN, mat: 'ADM-AFI-001', first: 'Admin', last: 'AFI', class: null },
    { email: 'student1@afi.com', role: Role.STUDENT, mat: 'STU-001', first: 'John', last: 'Doe', class: 'class-l3-info' },
    { email: 'student2@afi.com', role: Role.STUDENT, mat: 'STU-002', first: 'Jane', last: 'Smith', class: 'class-l3-info' },
  ];

  for (const u of users) {
    const schoolId = u.role === Role.SUPERADMIN ? null : DEFAULT_SCHOOL_ID;
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        matricule: u.mat,
        role: u.role,
        classId: u.class,
        campusId: campusDakar.id,
        schoolId,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      create: {
        email: u.email,
        passwordHash: u.email.includes('student') ? studentPassword : passwordHash,
        firstName: u.first,
        lastName: u.last,
        role: u.role,
        isActive: true,
        matricule: u.mat,
        classId: u.class,
        campusId: campusDakar.id,
        schoolId,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  console.log('✅ Users');

  await prisma.systemSettings.upsert({
    where: { schoolId: DEFAULT_SCHOOL_ID },
    update: {},
    create: {
      schoolId: DEFAULT_SCHOOL_ID,
      schoolName: 'AFI Université',
      aiEnabled: true,
      aiConfigs: [
        {
          id: 'config-gemini',
          name: 'Gemini Pro',
          provider: 'GEMINI',
          model: 'gemini-pro',
          apiKey: process.env.GEMINI_API_KEY,
          priority: 1,
          isFree: false,
        },
      ],
    },
  });

  console.log('✅ System settings');

  const existingCampaign = await prisma.evaluationCampaign.findFirst({
    where: { title: 'Évaluation Mi-Semestre L3 Info' },
  });

  if (!existingCampaign) {
    await prisma.evaluationCampaign.create({
      data: {
        title: 'Évaluation Mi-Semestre L3 Info',
        description: 'Veuillez évaluer vos cours pour nous aider à nous améliorer.',
        scope: 'CLASS',
        classId: 'class-l3-info',
        moduleId: modIds['Base de données'],
        professorId: profIds['diallo@afi.com'],
        status: 'ACTIVE',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Sample evaluation campaign');
  }

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
