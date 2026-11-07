import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { EmailProcessor } from './email.processor';
import { EMAIL_JOBS } from './email.constants';

const mockResendSend = jest.fn();

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockResendSend,
      },
    })),
  };
});

describe('EmailProcessor', () => {
  let processor: EmailProcessor;

  beforeEach(async () => {
    mockResendSend.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key: string) => {
              if (key === 'RESEND_EMAIL_KEY') return 're_test_key_123';
              if (key === 'FRONTEND_URL') return 'http://localhost:4000';
              return '';
            }),
            get: jest.fn().mockImplementation((key: string, defaultVal?: string) => {
              if (key === 'EMAIL_FROM') return 'DevStack Auth <test@example.com>';
              return defaultVal;
            }),
          },
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process verification email', () => {
    it('should send verification email through Resend successfully', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'resend_msg_123' },
        error: null,
      });

      const job = {
        id: 'job_1',
        name: EMAIL_JOBS.VERIFICATION,
        attemptsMade: 0,
        data: {
          email: 'user@example.com',
          token: 'token_abc_123',
        },
      } as unknown as Job;

      await processor.process(job);

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'DevStack Auth <test@example.com>',
          to: ['user@example.com'],
          subject: expect.stringContaining('Verify'),
          html: expect.stringContaining('http://localhost:4000/auth/verify-email?token=token_abc_123'),
        }),
      );
    });

    it('should throw an error when Resend API returns an error response to trigger BullMQ retry', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: {
          message: 'Rate limit exceeded',
          name: 'rate_limit_exceeded',
        },
      });

      const job = {
        id: 'job_1',
        name: EMAIL_JOBS.VERIFICATION,
        attemptsMade: 0,
        data: {
          email: 'user@example.com',
          token: 'token_abc_123',
        },
      } as unknown as Job;

      await expect(processor.process(job)).rejects.toThrow(
        'Resend delivery failed: Rate limit exceeded',
      );
    });
  });

  describe('process password reset email', () => {
    it('should send password reset email through Resend successfully', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'resend_msg_456' },
        error: null,
      });

      const job = {
        id: 'job_2',
        name: EMAIL_JOBS.PASSWORD_RESET,
        attemptsMade: 0,
        data: {
          email: 'reset@example.com',
          token: 'reset_token_789',
        },
      } as unknown as Job;

      await processor.process(job);

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'DevStack Auth <test@example.com>',
          to: ['reset@example.com'],
          subject: expect.stringContaining('Reset'),
          html: expect.stringContaining('http://localhost:4000/auth/reset-password?token=reset_token_789'),
        }),
      );
    });
  });

  describe('process unknown job', () => {
    it('should not call Resend for unrecognized job names', async () => {
      const job = {
        id: 'job_3',
        name: 'unknown-job',
        attemptsMade: 0,
        data: {},
      } as unknown as Job;

      await processor.process(job);

      expect(mockResendSend).not.toHaveBeenCalled();
    });
  });

  describe('worker lifecycle events', () => {
    it('should handle completed and failed events cleanly', () => {
      const job = {
        id: 'job_4',
        name: EMAIL_JOBS.VERIFICATION,
        attemptsMade: 1,
        opts: { attempts: 3 },
      } as unknown as Job;

      expect(() => processor.onCompleted(job)).not.toThrow();
      expect(() => processor.onFailed(job, new Error('Network timeout'))).not.toThrow();
    });
  });
});
