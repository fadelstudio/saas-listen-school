import { Role, ReportType, ReportStatus, Priority, EvaluationStatus, RatingBand, DecisionStatus, AiJobStatus } from '@prisma/client';
import { prisma } from '../src/core/database/prisma';
import bcrypt from 'bcrypt';
import 'dotenv/config';

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
  console.log('🌱 Seeding Diverse & Comprehensive Data Scenario...');
  await clearData();

  const passwordHash = await bcrypt.hash('Changeme@123', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const adminPassword = await bcrypt.hash('fadeldev', 12);

  // 1. School & Settings
  await prisma.school.upsert({
    where: { id: DEFAULT_SCHOOL_ID },
    update: {},
    create: { id: DEFAULT_SCHOOL_ID, name: "AFI L'UE", slug: 'afi', domain: 'afi-ue.sn' },
  });

  await prisma.systemSettings.upsert({
    where: { schoolId: DEFAULT_SCHOOL_ID },
    update: {},
    create: {
      schoolId: DEFAULT_SCHOOL_ID,
      schoolName: "AFI L'UE",
      authOtpRequired: false,
      aiEnabled: true,
      aiConfigs: [],
    }
  });

  // 2. Structure
  const campusDakar = await prisma.campus.upsert({
    where: { name: 'Campus Dakar Point E' },
    update: {},
    create: { name: 'Campus Dakar Point E', location: 'Dakar', schoolId: DEFAULT_SCHOOL_ID }
  });
  const campusAbidjan = await prisma.campus.upsert({
    where: { name: 'Campus Abidjan Plateau' },
    update: {},
    create: { name: 'Campus Abidjan Plateau', location: 'Abidjan', schoolId: DEFAULT_SCHOOL_ID }
  });

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

  // 3. Admins
  const adminAfi = await prisma.user.create({
    data: {
      email: 'admin@afi.com', firstName: 'Admin', lastName: 'AFI', role: Role.ADMIN,
      schoolId: DEFAULT_SCHOOL_ID, passwordHash: adminPassword, emailVerified: true,
    },
  });
  const adminIssa = await prisma.user.create({
    data: {
      email: 'issa@afi.com', firstName: 'Issa', lastName: 'Diop', role: Role.ADMIN,
      schoolId: DEFAULT_SCHOOL_ID, passwordHash: adminPassword, emailVerified: true,
    },
  });

  // 4. Professors (12 Professors)
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
    await prisma.classModule.create({
      data: {
        classId: cls.id,
        moduleId: mod.id,
        professors: { connect: [{ id: professors[i].id }] },
      },
    });
    assignments.push({ professorId: professors[i].id, moduleId: mod.id, classId: cls.id });
  }

  // 4. Students (25 Students)
  const studentNames = ['Omar', 'Awa', 'Fatou', 'Moussa', 'Jean', 'Modou', 'Bineta', 'Saliou', 'Penda', 'Babacar', 'Ramata', 'Abdou', 'Khady', 'Talla', 'Astou', 'Malick', 'Dior', 'Bamba', 'Fatimata', 'Alioune', 'Yasmine', 'Cheikh', 'Nafi', 'Demba', 'Binta'];
  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const cls = i < 15 ? classL3 : classM1;
    const campus = i < 15 ? campusDakar : campusAbidjan;
    students.push(await prisma.user.create({
      data: {
        email: `${studentNames[i].toLowerCase()}.${i}@student.afi.com`, firstName: studentNames[i], lastName: 'Ndiaye', role: Role.STUDENT,
        schoolId: DEFAULT_SCHOOL_ID, classId: cls.id, campuses: { connect: [{ id: campus.id }] },
        passwordHash: studentPassword, emailVerified: true,
      },
    }));
  }

  // 5. Campaigns & Evaluations
  for (const assign of assignments) {
    const campaign = await prisma.evaluationCampaign.create({
      data: {
        title: `Évaluation ${professors.find(p => p.id === assign.professorId)?.lastName} - ${modules.find(m => m.id === assign.moduleId)?.name}`,
        scope: 'CLASS', classId: assign.classId, moduleId: assign.moduleId, professorId: assign.professorId,
        status: 'ACTIVE', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
    });

    const classStudents = students.filter(s => s.classId === assign.classId);
    for (let j = 0; j < 3; j++) {
      const student = classStudents[j % classStudents.length];
      await prisma.evaluation.create({
        data: {
          schoolId: DEFAULT_SCHOOL_ID, campaignId: campaign.id, evaluatorId: student.id,
          professorId: assign.professorId, moduleId: assign.moduleId, classId: assign.classId,
          status: EvaluationStatus.COMPLETED, score: 12 + Math.floor(Math.random() * 8),
          isAnonymous: j % 2 === 0,
          comprehensionRating: RatingBand.GOOD, explanationRating: RatingBand.EXCELLENT,
          pedagogyRating: RatingBand.GOOD, availabilityRating: RatingBand.FAIR, rhythmRating: RatingBand.GOOD,
          comment: "Bon cours dans l'ensemble.",
        },
      });
    }
  }

  // 6. RICH & VARIED REPORTS (40+ Reports)
  console.log('📝 Generating rich and varied reports...');
  const reportScenarios = [
    { type: ReportType.PROBLEM_MATERIAL, title: "Climatisation Salle 102 en panne", content: "Il fait extrêmement chaud en salle 102, la clim ne marche plus depuis lundi.", priority: Priority.HIGH },
    { type: ReportType.PROBLEM_PEDAGOGICAL, title: "Manque de supports de cours", content: "Le professeur ne nous a pas encore transmis les slides du dernier chapitre.", priority: Priority.MEDIUM },
    { type: ReportType.INCIDENT, title: "Incident dans les escaliers", content: "Une marche semble instable au deuxième étage, attention aux chutes.", priority: Priority.CRITICAL },
    { type: ReportType.SUGGESTION, title: "Installation de fontaines à eau", content: "Ce serait bien d'avoir des fontaines à eau accessibles dans les couloirs.", priority: Priority.LOW },
    { type: ReportType.PROBLEM_MATERIAL, title: "Wifi instable au 3ème étage", content: "Impossible de se connecter correctement pour les TP de programmation.", priority: Priority.HIGH },
    { type: ReportType.PROBLEM_PEDAGOGICAL, title: "Rythme de cours trop rapide", content: "Beaucoup d'étudiants ont du mal à suivre le rythme actuel en mathématiques.", priority: Priority.MEDIUM },
    { type: ReportType.SUGGESTION, title: "Organisation d'un Hackathon", content: "Pourquoi ne pas organiser un hackathon interne pour la filière info ?", priority: Priority.LOW },
    { type: ReportType.INCIDENT, title: "Vols signalés dans les casiers", content: "Plusieurs étudiants ont rapporté des disparitions d'effets personnels.", priority: Priority.CRITICAL },
    { type: ReportType.PROBLEM_MATERIAL, title: "Projecteur défectueux Amphi A", content: "L'image saute tout le temps, c'est très difficile de voir le tableau.", priority: Priority.MEDIUM },
    { type: ReportType.OTHER, title: "Demande de partenariat entreprises", content: "Serait-il possible d'avoir plus de conférences avec des professionnels ?", priority: Priority.LOW },
    { type: ReportType.PROBLEM_PEDAGOGICAL, title: "Méthode d'évaluation peu claire", content: "On ne comprend pas bien comment les projets seront notés.", priority: Priority.MEDIUM },
    { type: ReportType.PROBLEM_MATERIAL, title: "Manque de prises électriques", content: "Pas assez de prises pour charger les ordinateurs en salle de TP.", priority: Priority.MEDIUM },
    { type: ReportType.SUGGESTION, title: "Club de sport universitaire", content: "On aimerait créer une équipe de foot officielle pour représenter l'école.", priority: Priority.LOW },
    { type: ReportType.INCIDENT, title: "Aggression aux abords de l'école", content: "Un étudiant s'est fait voler son sac juste devant le portail hier soir.", priority: Priority.CRITICAL },
    { type: ReportType.PROBLEM_PEDAGOGICAL, title: "Supports de cours obsolètes", content: "Certains exemples utilisés en cours datent de plus de 10 ans.", priority: Priority.MEDIUM },
    { type: ReportType.SUGGESTION, title: "Ouverture bibliothèque le samedi", content: "Ce serait utile de pouvoir réviser à l'école le week-end.", priority: Priority.MEDIUM },
  ];

  for (let i = 0; i < 45; i++) {
    const scenario = reportScenarios[i % reportScenarios.length];
    const student = students[Math.floor(Math.random() * students.length)];
    const isAnonymous = i % 3 === 0;
    
    // Randomize status
    const statusValues = [ReportStatus.SUBMITTED, ReportStatus.REVIEWED, ReportStatus.APPROVED, ReportStatus.REJECTED];
    const status = statusValues[Math.floor(Math.random() * statusValues.length)];

    const report = await prisma.report.create({
      data: {
        title: `${scenario.title} #${i}`,
        content: scenario.content,
        type: scenario.type,
        priority: scenario.priority,
        isAnonymous: isAnonymous,
        authorId: student.id,
        schoolId: DEFAULT_SCHOOL_ID,
        classId: student.classId,
        status: status,
      },
    });

    // Add a decision for processed reports
    if (status !== ReportStatus.SUBMITTED) {
      await prisma.decision.create({
        data: {
          reportId: report.id,
          deciderId: i % 2 === 0 ? adminAfi.id : adminIssa.id,
          title: `Décision sur le rapport #${i}`,
          rationale: `Action prise pour le rapport #${i}. Statut mis à jour à ${status}.`,
          status: status === ReportStatus.APPROVED ? DecisionStatus.VALIDATED : DecisionStatus.REJECTED,
          schoolId: DEFAULT_SCHOOL_ID,
        }
      });
    }
  }

  console.log('✨ Seed finished: 45+ rich reports with decisions and admins injected!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
