/**
 * Safe public user representation without sensitive fields like passwordHash.
 */
export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Register payload.
 */
export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Login payload.
 */
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Resend verification email payload.
 */
export interface ResendVerificationInput {
  email: string;
}

/**
 * Verify email payload.
 */
export interface VerifyEmailInput {
  token: string;
}

/**
 * Forgot password payload.
 */
export interface ForgotPasswordInput {
  email: string;
}

/**
 * Reset password payload.
 */
export interface ResetPasswordInput {
  token: string;
  password: string;
}

/**
 * Change password payload for an authenticated user.
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Device and client tracking metadata.
 */
export interface SessionDeviceType {
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  clientType?: string;
}

/**
 * Active session representation.
 */
export interface UserSession {
  id: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceName?: string | null;
  clientType?: string | null;
  createdAt: string | Date;
  lastActiveAt: string | Date;
  expiresAt: string | Date;
  isCurrent?: boolean;
}

/**
 * Sessions Interface
 */
export interface GetSession {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  clientType: string | null;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}
