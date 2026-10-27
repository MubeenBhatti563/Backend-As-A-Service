import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  password: z.string().min(8, 'Password must be at least 8 chars long!'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
