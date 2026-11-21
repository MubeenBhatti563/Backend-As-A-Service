import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { strongPasswordSchema } from '../../../common/validators/password.validator';

const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email must not empty!' })
    .email({ message: 'Enter a valid email address' })
    .toLowerCase(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(32, { message: 'The token is not valid!' }),
});

const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  token: z.string().min(32, { message: 'Token is not valid!' }),
});

export class ResendVerificationDto extends createZodDto(
  resendVerificationSchema,
) {}
export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
