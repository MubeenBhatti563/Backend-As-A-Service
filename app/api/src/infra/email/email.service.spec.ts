import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { getQueueToken } from '@nestjs/bullmq';
import { EMAIL_JOBS, EMAIL_QUEUE } from '../../workers/email-workers';

describe('EmailService', () => {
  let service: EmailService;
  let queueMock: {
    add: jest.Mock;
  };

  beforeEach(async () => {
    queueMock = {
      add: jest.fn().mockResolvedValue({ id: 'job_123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken(EMAIL_QUEUE),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationLink', () => {
    it('should add a verification email job to the email queue', async () => {
      const email = 'user@example.com';
      const token = 'verification_token_abc';

      await service.sendVerificationLink(email, token);

      expect(queueMock.add).toHaveBeenCalledTimes(1);
      expect(queueMock.add).toHaveBeenCalledWith(EMAIL_JOBS.VERIFICATION, {
        email,
        token,
      });
    });

    it('should throw and log error if queue.add fails', async () => {
      const email = 'user@example.com';
      const token = 'verification_token_abc';
      const queueError = new Error('Redis connection lost');
      queueMock.add.mockRejectedValue(queueError);

      await expect(service.sendVerificationLink(email, token)).rejects.toThrow(
        'Redis connection lost',
      );
    });
  });

  describe('sendPasswordResetLink', () => {
    it('should add a password reset email job to the email queue', async () => {
      const email = 'user@example.com';
      const token = 'password_reset_token_xyz';

      await service.sendPasswordResetLink(email, token);

      expect(queueMock.add).toHaveBeenCalledTimes(1);
      expect(queueMock.add).toHaveBeenCalledWith(EMAIL_JOBS.PASSWORD_RESET, {
        email,
        token,
      });
    });

    it('should throw and log error if queue.add fails', async () => {
      const email = 'user@example.com';
      const token = 'password_reset_token_xyz';
      const queueError = new Error('Redis queue full');
      queueMock.add.mockRejectedValue(queueError);

      await expect(service.sendPasswordResetLink(email, token)).rejects.toThrow(
        'Redis queue full',
      );
    });
  });
});
