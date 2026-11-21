import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { strongPasswordSchema } from '../../../common/validators/password.validator';

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(128, 'Password is too long'),
  newPassword: strongPasswordSchema,
});

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
