import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateBucketAccessSchema = z.object({
  access: z.enum(['Public', 'Private']),
});

export class UpdateBucketAccessDto extends createZodDto(
  updateBucketAccessSchema,
) {}
