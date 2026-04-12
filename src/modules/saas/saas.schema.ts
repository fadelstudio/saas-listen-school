import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'Le nom de l\'école est requis'),
  location: z.string().optional(),
  adminEmail: z.string().email('Email admin invalide'),
  adminPassword: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  adminFirstName: z.string().min(1, 'Prénom obligatoire'),
  adminLastName: z.string().min(1, 'Nom obligatoire'),
  matricule: z.string().optional(),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
