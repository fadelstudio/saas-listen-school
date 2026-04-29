import { Role, ReportType, ReportStatus, Priority, EvaluationStatus, RatingBand, DecisionStatus, AiJobStatus, Sex } from '@prisma/client';
import { prisma } from '../src/core/database/prisma';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const DEFAULT_SCHOOL_ID = 'afi';

async function clearData() {
  console.log('🗑️ Clearing data...');
  // Delete in order to satisfy foreign key constraints
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.aiJob.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.evaluationCampaign.deleteMany();
  await prisma.analysisReport.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.loginOtpChallenge.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.classModule.deleteMany();
  await prisma.module.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.user.deleteMany({ where: { role: { notIn: [Role.SUPERADMIN] } } });
  await prisma.class.deleteMany();
  await prisma.academicLevel.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.school.deleteMany();
  console.log('✅ Data cleared.');
}

async function main() {
  console.log('🌱 Seeding 12+ elements per table for "AFI-UE" and related structures...');
  await clearData();

  const passwordHash = await bcrypt.hash('Changeme@123', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const adminPassword = await bcrypt.hash('fadeldev', 12);

  // 1. Schools (Need 12)
  const schools = [];
  const schoolNames = [
    "AFI L'UE", "ISI", "BEM", "IAM", "ISM", "Sup de Co", "ESTM", "UGB", "UCAD", "UT", "UADB", "USSEIN"
  ];
  for (let i = 0; i < schoolNames.length; i++) {
    const slug = schoolNames[i].toLowerCase().replace(/ /g, '-').replace(/'/g, '');
    const id = i === 0 ? DEFAULT_SCHOOL_ID : `school-${i}`;
    schools.push(await prisma.school.create({
      data: {
        id: id,
        name: schoolNames[i],
        slug: slug,
        domain: `${slug}.sn`,
      }
    }));
  }

  // 2. System Settings (Need 1 per school, so 12)
  for (const school of schools) {
    await prisma.systemSettings.create({
      data: {
        schoolId: school.id,
        schoolName: school.name,
        aiEnabled: true,
      }
    });
  }

  const mainSchool = schools[0];

  // 3. Campuses (Need 12 for mainSchool)
  const campuses = [];
  const campusNames = [
    'Dakar Point E', 'Abidjan Plateau', 'Saint-Louis', 'Thiès', 'Ziguinchor',
    'Kaolack', 'Diourbel', 'Tambacounda', 'Kolda', 'Louga', 'Fatick', 'Matam'
  ];
  for (const name of campusNames) {
    campuses.push(await prisma.campus.create({
      data: { name: `Campus ${name}`, location: name, schoolId: mainSchool.id }
    }));
  }

  // 4. Academic Levels (Need 12)
  const levels = [];
  for (let i = 1; i <= 12; i++) {
    levels.push(await prisma.academicLevel.create({
      data: { name: `Niveau ${i}`, order: i, schoolId: mainSchool.id }
    }));
  }

  // 5. Classes (Need 12)
  const classes = [];
  for (let i = 0; i < 12; i++) {
    classes.push(await prisma.class.create({
      data: {
        name: `Classe ${i + 1}`,
        levelId: levels[i % levels.length].id,
        campusId: campuses[i % campuses.length].id
      }
    }));
  }

  // 6. Modules (Need 12)
  const modules = [];
  const moduleNames = [
    'Développement Web', 'Réseaux', 'IA', 'Marketing', 'Droit', 'Gestion',
    'Maths', 'Physique', 'Anglais', 'Communication', 'Base de données', 'Sécurité'
  ];
  for (const name of moduleNames) {
    modules.push(await prisma.module.create({
      data: { name, schoolId: mainSchool.id }
    }));
  }

  // 7. Professors (Need 12)
  const professors = [];
  for (let i = 0; i < 12; i++) {
    professors.push(await prisma.professor.create({
      data: {
        firstName: `Prof ${i + 1}`,
        lastName: `AFI`,
        email: `prof${i + 1}@afi.com`,
        schoolId: mainSchool.id
      }
    }));
  }

  // 8. ClassModules (Need 12)
  for (let i = 0; i < 12; i++) {
    await prisma.classModule.create({
      data: {
        classId: classes[i].id,
        moduleId: modules[i].id,
        professors: { connect: [{ id: professors[i].id }] }
      }
    });
  }

  // 9. Users (Need 12+ Admins/Students)
  const admins = [];
  for (let i = 0; i < 12; i++) {
    admins.push(await prisma.user.create({
      data: {
        email: `admin${i + 1}@afi.com`,
        firstName: `Admin`,
        lastName: `${i + 1}`,
        role: Role.ADMIN,
        schoolId: mainSchool.id,
        passwordHash: adminPassword,
        emailVerified: true
      }
    }));
  }

  const students = [];
  for (let i = 0; i < 20; i++) {
    students.push(await prisma.user.create({
      data: {
        email: `student${i + 1}@student.afi.com`,
        firstName: `Etudiant`,
        lastName: `${i + 1}`,
        role: Role.STUDENT,
        schoolId: mainSchool.id,
        classId: classes[i % classes.length].id,
        passwordHash: studentPassword,
        emailVerified: true
      }
    }));
  }

  // 10. Evaluation Campaigns (Need 12)
  const campaigns = [];
  for (let i = 0; i < 12; i++) {
    campaigns.push(await prisma.evaluationCampaign.create({
      data: {
        title: `Campagne ${i + 1}`,
        scope: 'CLASS',
        classId: classes[i].id,
        moduleId: modules[i].id,
        professorId: professors[i].id,
        status: 'ACTIVE',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }));
  }

  // 11. Reports (Need 12)
  const reports = [];
  for (let i = 0; i < 15; i++) {
    reports.push(await prisma.report.create({
      data: {
        title: `Rapport #${i + 1}`,
        content: `Contenu du rapport de test #${i + 1}`,
        type: i % 2 === 0 ? ReportType.PROBLEM_MATERIAL : ReportType.PROBLEM_PEDAGOGICAL,
        status: ReportStatus.SUBMITTED,
        schoolId: mainSchool.id,
        authorId: students[i % students.length].id,
        classId: students[i % students.length].classId
      }
    }));
  }

  // 12. Evaluations (Need 12)
  const evaluations = [];
  for (let i = 0; i < 15; i++) {
    evaluations.push(await prisma.evaluation.create({
      data: {
        schoolId: mainSchool.id,
        campaignId: campaigns[i % campaigns.length].id,
        evaluatorId: students[i % students.length].id,
        professorId: professors[i % professors.length].id,
        moduleId: modules[i % modules.length].id,
        classId: classes[i % classes.length].id,
        status: EvaluationStatus.COMPLETED,
        score: 15,
        pedagogyRating: RatingBand.GOOD,
        explanationRating: RatingBand.GOOD,
        comprehensionRating: RatingBand.GOOD,
        availabilityRating: RatingBand.GOOD,
        rhythmRating: RatingBand.GOOD
      }
    }));
  }

  // 13. Decisions (Need 12)
  for (let i = 0; i < 12; i++) {
    await prisma.decision.create({
      data: {
        reportId: i < 6 ? reports[i].id : null,
        evaluationId: i >= 6 ? evaluations[i].id : null,
        deciderId: admins[0].id,
        title: `Décision ${i + 1}`,
        rationale: `Action corrective #${i + 1}`,
        status: DecisionStatus.APPROVED,
        schoolId: mainSchool.id
      }
    });
  }

  // 14. Audit Logs (Need 12)
  for (let i = 0; i < 12; i++) {
    await prisma.auditLog.create({
      data: {
        schoolId: mainSchool.id,
        userId: admins[0].id,
        action: 'CREATE_REPORT',
        entity: 'Report',
        details: { info: `Log info ${i}` }
      }
    });
  }

  // 15. Notifications (Need 12)
  for (let i = 0; i < 12; i++) {
    await prisma.notification.create({
      data: {
        title: `Notif ${i + 1}`,
        message: `Message de notification ${i + 1}`,
        type: 'SYSTEM',
        userId: students[i % students.length].id,
        schoolId: mainSchool.id
      }
    });
  }

  // 16. Analysis Reports (Need 12)
  for (let i = 0; i < 12; i++) {
    await prisma.analysisReport.create({
      data: {
        schoolId: mainSchool.id,
        title: `Analyse ${i + 1}`,
        content: { summary: "Tout va bien" },
        filters: { campusId: "all" },
        generatedById: admins[0].id
      }
    });
  }

  // 17. Ai Jobs (Need 12)
  for (let i = 0; i < 12; i++) {
    await prisma.aiJob.create({
      data: {
        jobType: 'report-analysis',
        status: AiJobStatus.DONE,
        payload: { text: "analyze me" },
        result: { sentiment: "positive" }
      }
    });
  }

  // 18. Ai Conversations & Messages (Need 12)
  for (let i = 0; i < 12; i++) {
    const conv = await prisma.aiConversation.create({
      data: {
        schoolId: mainSchool.id,
        userId: admins[0].id,
        title: `Conversation ${i + 1}`
      }
    });
    await prisma.aiMessage.create({
      data: {
        conversationId: conv.id,
        role: 'user',
        content: `Hello ${i}`
      }
    });
  }

  // 19. Tokens (Need 12 each)
  for (let i = 0; i < 12; i++) {
    const user = students[i % students.length];
    await prisma.refreshToken.create({ data: { token: `token-${i}`, userId: user.id, expiresAt: new Date(Date.now() + 1000000) } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: `hash-${i}`, expiresAt: new Date(Date.now() + 1000000) } });
    await prisma.loginOtpChallenge.create({ data: { userId: user.id, otpHash: `otp-${i}`, expiresAt: new Date(Date.now() + 1000000) } });
  }

  console.log('✨ Seed finished: 12+ elements per table injected for AFI-UE and more!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
