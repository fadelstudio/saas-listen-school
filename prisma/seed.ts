import { PrismaClient, Role, ReportType, ReportStatus, Priority, EvaluationStatus, RatingBand, DecisionStatus, AiJobStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_SCHOOL_ID = 'afi-default-school';

async function clearData() {
  console.log('🗑️ Clearing data...');
  const usersToKeep = await prisma.user.findMany({
    where: { role: { in: [Role.SUPERADMIN, Role.ADMIN] } },
    select: { id: true },
  });
  const keptUserIds = usersToKeep.map((u) => u.id);

  await prisma.aiJob.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.evaluationCampaign.deleteMany();
  await prisma.classModule.deleteMany();
  await prisma.module.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.user.deleteMany({ where: { id: { notIn: keptUserIds } } });
  await prisma.class.deleteMany();
  await prisma.academicLevel.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.systemSettings.deleteMany({ where: { schoolId: { not: DEFAULT_SCHOOL_ID } } });
  await prisma.school.deleteMany({ where: { id: { not: DEFAULT_SCHOOL_ID } } });
  console.log('✅ Data cleared.');
}

async function main() {
  console.log('🌱 Seeding Total Professor Coverage Scenario...');
  await clearData();

  const passwordHash = await bcrypt.hash('Changeme@123', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);

  // 1. School
  await prisma.school.upsert({
    where: { id: DEFAULT_SCHOOL_ID },
    update: {},
    create: { id: DEFAULT_SCHOOL_ID, name: "AFI L'UE", slug: 'afi', domain: 'afi-ue.sn' },
  });

  // 2. Structure
  const campusDakar = await prisma.campus.create({ data: { name: 'Campus Dakar Point E', location: 'Dakar', schoolId: DEFAULT_SCHOOL_ID } });
  const campusAbidjan = await prisma.campus.create({ data: { name: 'Campus Abidjan Plateau', location: 'Abidjan', schoolId: DEFAULT_SCHOOL_ID } });

  const l3 = await prisma.academicLevel.create({ data: { name: 'Licence 3', order: 3, schoolId: DEFAULT_SCHOOL_ID } });
  const m1 = await prisma.academicLevel.create({ data: { name: 'Master 1', order: 4, schoolId: DEFAULT_SCHOOL_ID } });

  const classL3 = await prisma.class.create({ data: { name: 'L3 Informatique', levelId: l3.id, campusId: campusDakar.id } });
  const classM1 = await prisma.class.create({ data: { name: 'M1 Management', levelId: m1.id, campusId: campusAbidjan.id } });

  const modulesData = [
    { name: 'Développement Web', code: 'INF-301' },
    { name: 'Réseaux Informatiques', code: 'INF-302' },
    { name: 'Intelligence Artificielle', code: 'INF-401' },
    { name: 'Marketing Digital', code: 'MKT-301' },
    { name: 'Droit des Affaires', code: 'DRT-301' },
    { name: 'Gestion de Projet', code: 'MGT-401' },
  ];
  const modules = [];
  for (const m of modulesData) {
    modules.push(await prisma.module.create({ data: { ...m, schoolId: DEFAULT_SCHOOL_ID } }));
  }

  // 3. Professors (12 Professors)
  const profNames = [
    { first: 'Abdoulaye', last: 'Kane', email: 'a.kane@afi.com' },
    { first: 'Seynabou', last: 'Diop', email: 's.diop@afi.com' },
    { first: 'Issa', last: 'Traoré', email: 'i.traore@afi.com' },
    { first: 'Mariama', last: 'Ba', email: 'm.ba@afi.com' },
    { first: 'Cheikh', last: 'Anta Fall', email: 'c.fall@afi.com' },
    { first: 'Ndèye', last: 'Saliou', email: 'n.saliou@afi.com' },
    { first: 'Boubacar', last: 'Diallo', email: 'b.diallo@afi.com' },
    { first: 'Ousmane', last: 'Sonko', email: 'o.sonko@afi.com' },
    { first: 'Aminata', last: 'Touré', email: 'a.toure@afi.com' },
    { first: 'Khalifa', last: 'Sall', email: 'k.sall@afi.com' },
    { first: 'Aïssatou', last: 'Tall Sall', email: 'a.tall@afi.com' },
    { first: 'Bamba', last: 'Dieye', email: 'b.dieye@afi.com' },
  ];
  const professors = [];
  for (const p of profNames) {
    professors.push(await prisma.professor.create({ data: { firstName: p.first, lastName: p.last, email: p.email, schoolId: DEFAULT_SCHOOL_ID } }));
  }

  // Assign every professor to at least one module
  const assignments = [];
  for (let i = 0; i < professors.length; i++) {
    const mod = modules[i % modules.length];
    const cls = i < 6 ? classL3 : classM1;
    const assignment = await prisma.classModule.create({
      data: {
        classId: cls.id,
        moduleId: mod.id,
        professors: { connect: [{ id: professors[i].id }] },
      },
    });
    assignments.push({ professorId: professors[i].id, moduleId: mod.id, classId: cls.id });
  }

  // 4. Students (20 Students)
  const studentNames = ['Omar', 'Awa', 'Fatou', 'Moussa', 'Jean', 'Modou', 'Bineta', 'Saliou', 'Penda', 'Babacar', 'Ramata', 'Abdou', 'Khady', 'Talla', 'Astou', 'Malick', 'Dior', 'Bamba', 'Fatimata', 'Alioune'];
  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const cls = i < 10 ? classL3 : classM1;
    const campus = i < 10 ? campusDakar : campusAbidjan;
    students.push(await prisma.user.create({
      data: {
        email: `${studentNames[i].toLowerCase()}.${i}@student.afi.com`, firstName: studentNames[i], lastName: 'Ndiaye', role: Role.STUDENT,
        schoolId: DEFAULT_SCHOOL_ID, classId: cls.id, campuses: { connect: [{ id: campus.id }] },
        passwordHash: studentPassword, emailVerified: true,
      },
    }));
  }

  // 5. Campaigns & Evaluations for ALL Professors
  console.log('📊 Generating evaluations for all 12 professors...');
  const comments = ['Excellent prof', 'Très pédagogue', 'Cours enrichissant', 'Un peu rapide mais clair', 'Très disponible pour les questions', 'Supports de cours au top'];
  
  for (const assign of assignments) {
    // Create a campaign for this specific professor/module/class
    const campaign = await prisma.evaluationCampaign.create({
      data: {
        title: `Évaluation ${professors.find(p => p.id === assign.professorId)?.lastName} - ${modules.find(m => m.id === assign.moduleId)?.name}`,
        scope: 'CLASS', classId: assign.classId, moduleId: assign.moduleId, professorId: assign.professorId,
        status: 'ACTIVE', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate 4 evaluations from random students of the SAME class
    const classStudents = students.filter(s => s.classId === assign.classId);
    for (let j = 0; j < 4; j++) {
      const student = classStudents[j % classStudents.length];
      await prisma.evaluation.create({
        data: {
          schoolId: DEFAULT_SCHOOL_ID, campaignId: campaign.id, evaluatorId: student.id,
          professorId: assign.professorId, moduleId: assign.moduleId, classId: assign.classId,
          status: EvaluationStatus.COMPLETED, score: 12 + Math.floor(Math.random() * 8),
          isAnonymous: j % 2 === 0,
          comprehensionRating: RatingBand.GOOD, explanationRating: RatingBand.EXCELLENT,
          pedagogyRating: RatingBand.GOOD, availabilityRating: RatingBand.FAIR, rhythmRating: RatingBand.GOOD,
          comment: comments[Math.floor(Math.random() * comments.length)],
        },
      });
    }
  }

  // 6. Reports (20 generic reports)
  for (let i = 0; i < 20; i++) {
    const student = students[i % students.length];
    await prisma.report.create({
      data: {
        title: `Signalement #${i}`, content: `Contenu du signalement numéro ${i}`,
        type: i % 3 === 0 ? ReportType.PROBLEM_MATERIAL : ReportType.OTHER,
        isAnonymous: i % 2 === 0, authorId: student.id, schoolId: DEFAULT_SCHOOL_ID, classId: student.classId,
      },
    });
  }

  console.log('✨ Seed finished: All 12 professors now have evaluation data!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
