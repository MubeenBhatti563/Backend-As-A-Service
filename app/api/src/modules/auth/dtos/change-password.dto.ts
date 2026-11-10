import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(128, 'Password is too long'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&_\-#^~()+={}[\]:;"'<>,./\\|]/,
      'Password must contain at least one special character',
    ),
});

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
