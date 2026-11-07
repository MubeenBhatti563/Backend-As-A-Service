import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EMAIL_JOBS,
  EMAIL_QUEUE,
  SendPasswordResetEmailPayload,
  SendVerificationEmailPayload,
} from '../../workers/email-workers';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  /**
   * Enqueue Email Verification Link delivery
   */
  async sendVerificationLink(email: string, token: string): Promise<void> {
    try {
      const job = await this.emailQueue.add(
        EMAIL_JOBS.VERIFICATION,
        { email, token } satisfies SendVerificationEmailPayload,
      );

      this.logger.debug(
        `Queued verification email job ${job.id} for recipient ${email}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to enqueue verification email for ${email}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err;
    }
  }

  /**
   * Enqueue Password Reset Link delivery
   */
  async sendPasswordResetLink(email: string, token: string): Promise<void> {
    try {
      const job = await this.emailQueue.add(
        EMAIL_JOBS.PASSWORD_RESET,
        { email, token } satisfies SendPasswordResetEmailPayload,
      );

      this.logger.debug(
        `Queued password reset email job ${job.id} for recipient ${email}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to enqueue password reset email for ${email}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err;
    }
  }
}
