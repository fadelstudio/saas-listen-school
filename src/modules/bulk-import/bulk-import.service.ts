import { prisma } from '../../core/database/prisma';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

export const bulkImportService = {
  /**
   * Importe des étudiants depuis un CSV.
   * Format CSV : email,firstName,lastName,matricule,classId
   * - schoolId : école de l'admin qui importe
   * - campusId : campus cible (doit appartenir à l'école)
   * Chaque étudiant est rattaché à la classe ET au campus via la relation N:M.
   */
  async importStudents(schoolId: string, campusId: string, csvData: string) {
    // Valider que le campus appartient à l'école
    const campus = await prisma.campus.findFirst({
      where: { id: campusId, schoolId },
    });
    if (!campus) {
      return {
        success: 0,
        errors: ['Campus not found or does not belong to this school'],
      };
    }

    const lines = csvData.split('\n').filter(l => l.trim() !== '');
    const results = { success: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const email     = values[0]?.trim();
      const firstName = values[1]?.trim();
      const lastName  = values[2]?.trim();
      const matricule = values[3]?.trim() || undefined;
      const classId   = values[4]?.trim();

      if (!email || !firstName || !lastName || !classId) {
        results.errors.push(`Line ${i + 1}: Missing required fields (email, firstName, lastName, classId)`);
        continue;
      }

      // Valider que la classe appartient au campus (et donc à l'école)
      const cls = await prisma.class.findFirst({
        where: { id: classId, campusId, campus: { schoolId } },
      });
      if (!cls) {
        results.errors.push(`Line ${i + 1}: Class "${classId}" not found in campus "${campusId}" of this school`);
        continue;
      }

      try {
        const passwordHash = await bcrypt.hash(
          process.env.DEFAULT_PASSWORD_RESET || 'Changeme@123',
          SALT_ROUNDS,
        );
        await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            matricule: matricule || null,
            role: Role.STUDENT,
            schoolId,
            // Relation N:M : connect au campus via la table de jonction
            campuses: { connect: [{ id: campusId }] },
            classId,
            passwordHash,
            emailVerified: true,
          },
        });
        results.success++;
      } catch (e: any) {
        results.errors.push(`Line ${i + 1}: ${e.message}`);
      }
    }
    return results;
  },

  /**
   * Importe des professeurs depuis un CSV.
   * Format CSV : email,firstName,lastName
   * Note : le professeur n'a pas de schoolId direct ni campusId.
   * Il sera rattaché à l'école via ses assignations ClassModule (cf. /class-modules).
   * Un compte User avec role PROFESSOR est créé automatiquement avec le mot de passe par défaut.
   */
  async importProfessors(schoolId: string, _campusId: string, csvData: string) {
    const lines = csvData.split('\n').filter(l => l.trim() !== '');
    const results = { success: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const email     = values[0]?.trim();
      const firstName = values[1]?.trim();
      const lastName  = values[2]?.trim();

      if (!email || !firstName || !lastName) {
        results.errors.push(`Line ${i + 1}: Missing required fields (email, firstName, lastName)`);
        continue;
      }

      try {
        // Vérifier si un professeur avec cet email existe déjà
        const existingProfessor = await prisma.professor.findUnique({ where: { email } });
        if (existingProfessor) {
          results.errors.push(`Line ${i + 1}: A professor with email "${email}" already exists`);
          continue;
        }

        // Créer ou réutiliser le User lié
        let userId: string | undefined;
        const existingUser = await prisma.user.findFirst({
          where: { email, schoolId },
        });

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const passwordHash = await bcrypt.hash(
            process.env.DEFAULT_PASSWORD_RESET || 'Changeme@123',
            SALT_ROUNDS,
          );
          const newUser = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              role: Role.PROFESSOR,
              schoolId,
              passwordHash,
              emailVerified: true,
            },
          });
          userId = newUser.id;
        }

        // Créer le profil professeur (sans campusId — rattachement via ClassModule)
        await prisma.professor.create({
          data: {
            email,
            firstName,
            lastName,
            userId,
            schoolId,
          },
        });
        results.success++;
      } catch (e: any) {
        results.errors.push(`Line ${i + 1}: ${e.message}`);
      }
    }
    return results;
  },
};
