import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
});
export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}

export const updatePreferencesSchema = z.object({
  emailAlerts: z.boolean(),
  securityAlerts: z.boolean(),
});
export class UpdatePreferencesDto extends createZodDto(updatePreferencesSchema) {}
