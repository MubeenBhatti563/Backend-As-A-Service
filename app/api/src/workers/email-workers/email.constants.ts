export const EMAIL_QUEUE = 'email';

export const EMAIL_JOBS = {
  VERIFICATION: 'send-verification-email',
  PASSWORD_RESET: 'send-password-reset-email',
} as const;

export type EmailJobName = (typeof EMAIL_JOBS)[keyof typeof EMAIL_JOBS];
