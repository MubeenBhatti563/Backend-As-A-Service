import { createZodDto } from 'nestjs-zod';
import z, { email } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email().min(1, { message: 'Email must not empty!' }),
});

export class ResendVerificationDto extends createZodDto(
  resendVerificationSchema,
) {}
