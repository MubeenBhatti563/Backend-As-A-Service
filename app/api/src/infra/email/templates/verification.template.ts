import { renderBaseEmailTemplate } from './base.template';

export interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

export function getVerificationEmailTemplate(
  verifyLink: string,
): EmailTemplateResult {
  const subject = 'Verify your email address — DevStack';

  const html = renderBaseEmailTemplate({
    title: 'Verify your email address',
    badgeText: 'EMAIL VERIFICATION',
    badgeBg: 'rgba(37, 99, 235, 0.15)',
    badgeColor: '#38BDF8',
    badgeBorder: 'rgba(56, 189, 248, 0.25)',
    heading: 'Verify your email address',
    subtitle: 'Welcome to DevStack! Confirm your email to activate your account.',
    description:
      'Thank you for joining DevStack. To complete your registration and secure your developer workspace, please verify your email address by clicking the button below.',
    actionText: 'Verify Email Address',
    actionUrl: verifyLink,
    expiryText: 'This verification link will expire in <strong>24 hours</strong>.',
    securityNotice:
      'If you did not sign up for a DevStack account, please disregard this email. Your email address will not be registered without verification.',
  });

  const text = `Verify your email address for DevStack\n\nClick the link below to verify your email address (expires in 24 hours):\n${verifyLink}\n\nIf you did not create an account, you can safely ignore this email.`;

  return { subject, html, text };
}
