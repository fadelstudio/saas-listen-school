import { prisma } from '../../core/database/prisma';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

export const bulkImportService = {
  async importStudents(schoolId: string, campusId: string, csvData: string) {
    const lines = csvData.split('\n').filter(l => l.trim() !== '');
    const results = { success: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const email = values[0]?.trim();
      const firstName = values[1]?.trim();
      const lastName = values[2]?.trim();
      const matricule = values[3]?.trim();
      const classId = values[4]?.trim();

      if (!email || !firstName || !lastName || !classId) {
        results.errors.push(`Line ${i+1}: Missing required fields (email, firstName, lastName, classId)`);
        continue;
      }

      try {
        const passwordHash = await bcrypt.hash('Afi12345!', SALT_ROUNDS);
        await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            matricule,
            role: Role.STUDENT,
            schoolId,
            campusId,
            classId,
            passwordHash,
            emailVerified: true,
          }
        });
        results.success++;
      } catch (e: any) {
        results.errors.push(`Line ${i+1}: ${e.message}`);
      }
    }
    return results;
  },

  async importProfessors(_schoolId: string, campusId: string, csvData: string) {
    const lines = csvData.split('\n').filter(l => l.trim() !== '');
    const results = { success: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const email = values[0]?.trim();
      const firstName = values[1]?.trim();
      const lastName = values[2]?.trim();

      if (!email || !firstName || !lastName) {
        results.errors.push(`Line ${i+1}: Missing required fields (email, firstName, lastName)`);
        continue;
      }

      try {
        await prisma.professor.create({
          data: {
            email,
            firstName,
            lastName,
            campusId,
          }
        });
        results.success++;
      } catch (e: any) {
        results.errors.push(`Line ${i+1}: ${e.message}`);
      }
    }
    return results;
  }
};
