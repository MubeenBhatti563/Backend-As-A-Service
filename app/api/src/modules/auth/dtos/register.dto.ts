import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

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

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
