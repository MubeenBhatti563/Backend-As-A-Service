import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { strongPasswordSchema } from '../../../common/validators/password.validator';

const RegisterSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Enter your full name')
    .max(80, 'Name is too long'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  password: strongPasswordSchema,
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
