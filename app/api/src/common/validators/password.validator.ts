import { z } from 'zod';

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwertyuiop',
  'admin123',
  'welcome123',
  'letmein123',
  'changeme123',
  'iloveyou123',
]);

/**
 * Calculates a password strength score from 0 (very weak) to 4 (very strong).
 * Evaluates length, complexity, repetitions, and common dictionary attacks.
 */
export function calculatePasswordStrength(password: string): number {
  if (!password || typeof password !== 'string') return 0;
  if (password.length < 8) return 0;

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 0;
  }

  // Check for repeated characters (e.g., 'aaaaaaaa' or '11111111')
  if (/^(.)\1+$/.test(password) || /(.)\1{3,}/.test(password)) {
    return 1;
  }

  let score = 0;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
    Boolean,
  ).length;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (varietyCount >= 3) score += 1;
  if (varietyCount === 4) score += 1;

  if (varietyCount < 3 && score > 2) {
    score = 2;
  }

  return Math.min(4, Math.max(0, score));
}

export const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(
    /[@$!%*?&_\-#^~()+={}[\]:;"'<>,./\\|]/,
    'Password must contain at least one special character',
  )
  .refine((pwd) => calculatePasswordStrength(pwd) >= 3, {
    message:
      'Password is too weak or common. Use a combination of uppercase, lowercase, numbers, and symbols with at least 8 characters.',
  });
