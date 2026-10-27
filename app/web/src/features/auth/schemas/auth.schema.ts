import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Enter your full name")
      .max(80, "Name is too long"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    acceptTerms: z
      .boolean()
      .refine((v) => v, "You must accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
export type SignupPayload = Pick<
  SignupFormValues,
  "fullName" | "email" | "password"
>;

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordPayload = Pick<ResetPasswordFormValues, "password">;
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  const points = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (points <= 1) return 1; // Weak
  if (points === 2) return 2; // Fair
  if (points <= 4) return 3; // Strong
  return 4;
}
