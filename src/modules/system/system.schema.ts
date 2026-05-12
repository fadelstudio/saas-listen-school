import { z } from 'zod';

export const updateSystemSettingsSchema = z.object({
  schoolName:             z.string().min(1).optional(),
  authReportsRequired:    z.boolean().optional(),
  authEvaluationsRequired: z.boolean().optional(),
  authOtpRequired:        z.boolean().optional(),
  aiEnabled:              z.boolean().optional(),
  
  aiConfigs: z.array(z.object({
    id:       z.string(),
    name:     z.string(),
    provider: z.string(),
    model:    z.string(),
    apiKey:   z.string(),
    priority: z.number(),
    isFree:   z.boolean().optional(),
  })).optional(),

  aiOverrideConfigId: z.string().optional().nullable(),
});

export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
