import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { EMAIL_JOBS, EMAIL_QUEUE } from './email.constants';
import {
  SendPasswordResetEmailPayload,
  SendVerificationEmailPayload,
} from './email.interfaces';
import {
  getPasswordResetEmailTemplate,
  getVerificationEmailTemplate,
} from '../../infra/email/templates';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.resend = new Resend(this.configService.getOrThrow('RESEND_EMAIL_KEY'));
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'DevStack Auth <baas_app@resend.dev>';
  }

  private getFrontendUrl(): string {
    const rawUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    return rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `http://${rawUrl}`;
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(
      `Processing email job ${job.id} of type "${job.name}" (attempt ${job.attemptsMade + 1})`,
    );

    switch (job.name) {
      case EMAIL_JOBS.VERIFICATION: {
        const { email, token } = job.data as SendVerificationEmailPayload;
        await this.handleVerificationEmail(email, token);
        break;
      }

      case EMAIL_JOBS.PASSWORD_RESET: {
        const { email, token } = job.data as SendPasswordResetEmailPayload;
        await this.handlePasswordResetEmail(email, token);
        break;
      }

      default:
        this.logger.warn(`Unrecognized email job name: ${job.name}`);
        break;
    }
  }

  private async handleVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.getFrontendUrl();
    const verifyLink = `${appUrl}/auth/verify-email?token=${token}`;
    const { subject, html, text } = getVerificationEmailTemplate(verifyLink);

    await this.sendEmail(email, subject, html, text);
  }

  private async handlePasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.getFrontendUrl();
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;
    const { subject, html, text } = getPasswordResetEmailTemplate(resetLink);

    await this.sendEmail(email, subject, html, text);
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
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
      throw new Error(`Resend delivery failed: ${error.message}`);
    }

    this.logger.log(`Email delivered to ${to} (Message ID: ${data?.id})`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Email job ${job.id} (${job.name}) failed on attempt ${job.attemptsMade}/${job.opts.attempts || 3}: ${err.message}`,
      err.stack,
    );
  }
}
