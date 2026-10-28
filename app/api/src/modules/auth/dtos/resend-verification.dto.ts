import { createZodDto } from 'nestjs-zod';
import z, { email } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email().min(1, { message: 'Email must not empty!' }),
});

const verifyEmailSchema = z.object({
  token: z.string().min(32, { message: 'The token is not valid!' }),
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(
      /[@$!%*?&_\-#^~()+={}\[\]:;"'<>,.\/\\|]/,
      'Password must contain at least one special character',
    ),

  token: z.string().min(32, { message: 'Token is not valid!' }),
});

export class ResendVerificationDto extends createZodDto(
  resendVerificationSchema,
) {}
export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
