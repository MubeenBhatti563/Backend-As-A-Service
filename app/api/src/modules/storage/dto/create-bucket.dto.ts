import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createBucketSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Bucket name must contain at least 3 characters')
    .max(63, 'Bucket name cannot exceed 63 characters')
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      'Use lowercase letters, numbers, and hyphens; names must start and end with a letter or number',
    ),
});

export class CreateBucketDto extends createZodDto(createBucketSchema) {}
