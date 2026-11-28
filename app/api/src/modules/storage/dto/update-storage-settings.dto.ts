import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const cdnBaseUrlSchema = z
  .string()
  .url()
  .max(255)
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    );
  }, 'Use an HTTPS CDN origin without a path');

export const updateStorageSettingsSchema = z
  .object({
    cdnBaseUrl: cdnBaseUrlSchema.nullable().optional(),
    cacheTtlSeconds: z.number().int().min(0).max(86_400).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one storage setting',
  });

export class UpdateStorageSettingsDto extends createZodDto(
  updateStorageSettingsSchema,
) {}
