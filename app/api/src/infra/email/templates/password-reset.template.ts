import { renderBaseEmailTemplate } from './base.template';
import { EmailTemplateResult } from './verification.template';

export function getPasswordResetEmailTemplate(
  resetLink: string,
): EmailTemplateResult {
  const subject = 'Reset your password — DevStack';

  const html = renderBaseEmailTemplate({
    title: 'Reset your password',
    badgeText: 'PASSWORD RESET',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeColor: '#FBBF24',
    badgeBorder: 'rgba(245, 158, 11, 0.25)',
    heading: 'Reset your password',
    subtitle: 'We received a request to change your DevStack password.',
    description:
      'A password reset request was initiated for your DevStack account. To set a new secure password, click the button below.',
    actionText: 'Reset Password',
    actionUrl: resetLink,
    expiryText:
      'For security reasons, this link is valid for only <strong>15 minutes</strong>.',
    securityNotice:
      'If you did not request a password reset, no further action is required and your account remains safe. We recommend reviewing your account activity if you suspect unauthorized access.',
  });

  const text = `Reset your DevStack password\n\nClick the link below to reset your password (expires in 1 hour):\n${resetLink}\n\nIf you did not request a password reset, you can safely ignore this email.`;

  return { subject, html, text };
}
