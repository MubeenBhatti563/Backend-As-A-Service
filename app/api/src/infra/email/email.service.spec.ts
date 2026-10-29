import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key: string) => {
              if (key === 'RESEND_EMAIL_KEY') return 're_test_key_123';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return '';
            }),
            get: jest.fn().mockImplementation((key: string, defaultVal?: string) => {
              if (key === 'EMAIL_FROM') return 'test@example.com';
              return defaultVal;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
