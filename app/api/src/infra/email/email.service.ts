import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow('RESEND_EMAIL_KEY'));
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'DevStack Auth <baas_app@resend.dev>';
  }

  /**
   * Helper to resolve the frontend base URL with protocol
   */
  private getFrontendUrl(): string {
    const rawUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    return rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `http://${rawUrl}`;
  }

  /**
   * Send Email Verification Link
   */
  async sendVerificationLink(email: string, token: string): Promise<void> {
    const appUrl = this.getFrontendUrl();
    const verifyLink = `${appUrl}/auth/verify-email?token=${token}`;
    const { subject, html, text } = getVerificationEmailTemplate(verifyLink);

    await this.sendEmail(email, subject, html, text);
  }

  /**
   * Send Password Reset Link
   */
  async sendPasswordResetLink(email: string, token: string): Promise<void> {
    const appUrl = this.getFrontendUrl();
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;
    const { subject, html, text } = getPasswordResetEmailTemplate(resetLink);

    await this.sendEmail(email, subject, html, text);
  }

  /**
   * Core Resend API delivery method with explicit error inspection
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.error(
          `Resend API error sending email to ${to}: ${error.message} (status: ${error.name})`,
        );
      }

      this.logger.log(`Email sent successfully to ${to} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }
}
