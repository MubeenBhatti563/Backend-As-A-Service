import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { EmailService } from '../../infra/email/email.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenType } from '@prisma/client';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: {
    platformUser: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    verificationToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
    session: {
      create: jest.Mock;
      findMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let redisMock: {
    del: jest.Mock;
    get: jest.Mock;
    set: jest.Mock;
  };
  let emailMock: {
    sendVerificationLink: jest.Mock;
    sendPasswordResetLink: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      platformUser: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      verificationToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    redisMock = {
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    emailMock = {
      sendVerificationLink: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetLink: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'Test@example.COM ',
      fullName: ' John Doe ',
      password: 'SecurePassword123!',
    };

    it('should successfully register a user and send verification email', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      const createdUser = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        fullName: 'John Doe',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          platformUser: {
            create: jest.fn().mockResolvedValue(createdUser),
          },
          verificationToken: {
            create: jest.fn().mockResolvedValue({ id: 'token-1' }),
          },
        };
        return callback(txMock);
      });

      const result = await service.register(registerDto);

      expect(result).toEqual(createdUser);
      expect(prismaMock.platformUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(emailMock.sendVerificationLink).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
      );
    });

    it('should throw ConflictException if email is already in use', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(emailMock.sendVerificationLink).not.toHaveBeenCalled();
    });

    it('should handle unique constraint race conditions (P2002) as ConflictException', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockRejectedValue({ code: 'P2002' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateCredentials', () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'ValidPassword123!',
    };

    it('should validate credentials and return safe user when correct', async () => {
      const passwordHash = await argon2.hash(loginDto.password);
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Jane Doe',
        passwordHash,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.validateCredentials(loginDto);

      expect(result).toEqual({
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Jane Doe',
        isVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      await expect(service.validateCredentials(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const wrongHash = await argon2.hash('DifferentPassword123!');
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Jane Doe',
        passwordHash: wrongHash,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.validateCredentials(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user is not verified', async () => {
      const passwordHash = await argon2.hash(loginDto.password);
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Jane Doe',
        passwordHash,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.validateCredentials(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification link for unverified user', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        isVerified: false,
      });
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await service.resendVerificationEmail('User@example.com ');

      expect(result).toEqual({
        message: 'Verification email sent successfully',
      });
      expect(prismaMock.platformUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
        select: { id: true, isVerified: true },
      });
      expect(emailMock.sendVerificationLink).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(String),
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      await expect(
        service.resendVerificationEmail('unknown@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is already verified', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        isVerified: true,
      });

      await expect(
        service.resendVerificationEmail('user@example.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email and delete token', async () => {
      const rawToken = 'a'.repeat(64);
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + 100000),
      });
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await service.verifyEmail(rawToken);

      expect(result).toEqual({ message: 'Email verified successfully!' });
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if token is missing or empty', async () => {
      await expect(service.verifyEmail('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token not found or wrong type', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException and delete expired token', async () => {
      const rawToken = 'a'.repeat(64);
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() - 100000),
      });
      prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.verifyEmail(rawToken)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { id: 'token-1' },
      });
    });
  });

  describe('forgotPassword', () => {
    it('should send reset link if user exists', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await service.forgotPassword('User@example.com');

      expect(result.message).toContain('If an account exists with this email');
      expect(emailMock.sendPasswordResetLink).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(String),
      );
    });

    it('should not throw or send email if user does not exist (prevent enumeration)', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('If an account exists with this email');
      expect(emailMock.sendPasswordResetLink).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password, mark user verified, and invalidate all sessions', async () => {
      const rawToken = 'b'.repeat(64);
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        type: TokenType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + 100000),
      });
      prismaMock.session.findMany.mockResolvedValue([
        { id: 'sess-1' },
        { id: 'sess-2' },
      ]);
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await service.resetPassword(
        rawToken,
        'NewStrongPassword123!',
      );

      expect(result.message).toContain('Password has been reset successfully');
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(redisMock.del).toHaveBeenCalledWith('sess:sess-1', 'sess:sess-2');
    });

    it('should throw BadRequestException if token is missing', async () => {
      await expect(service.resetPassword('', 'newPass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token not found or wrong type', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        type: TokenType.EMAIL_VERIFICATION, // wrong type!
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        service.resetPassword('someToken', 'NewPassword123!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token expired', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        type: TokenType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() - 5000),
      });
      prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 1 });

      await expect(
        service.resetPassword('someToken', 'NewPassword123!'),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { id: 'token-1' },
      });
    });
  });

  describe('getMe', () => {
    it('should return safe user when found', async () => {
      const safeUser = {
        id: 'user-1',
        fullName: 'Alice',
        email: 'alice@example.com',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.platformUser.findUnique.mockResolvedValue(safeUser);

      const result = await service.getMe('user-1');

      expect(result).toEqual(safeUser);
      expect(prismaMock.platformUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          fullName: true,
          email: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      await expect(service.getMe('nonexistent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout and logoutAll', () => {
    it('should logout specific session from DB and Redis', async () => {
      prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('sess-123');

      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { id: 'sess-123' },
      });
      expect(redisMock.del).toHaveBeenCalledWith('sess:sess-123');
    });

    it('should logout all sessions for a user from DB and Redis', async () => {
      prismaMock.session.findMany.mockResolvedValue([
        { id: 'sess-1' },
        { id: 'sess-2' },
      ]);
      prismaMock.session.deleteMany.mockResolvedValue({ count: 2 });

      await service.logoutAll('user-1');

      expect(redisMock.del).toHaveBeenCalledWith('sess:sess-1', 'sess:sess-2');
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('createSession', () => {
    it('should create session record with device metadata', async () => {
      prismaMock.session.create.mockResolvedValue({ id: 'sess-1' });

      await service.createSession('user-1', 'sess-1', {
        ipAddress: '127.0.0.1',
        deviceName: 'MacBook Pro',
        clientType: 'desktop',
        userAgent: 'Mozilla/5.0',
      });

      expect(prismaMock.session.create).toHaveBeenCalledWith({
        data: {
          id: 'sess-1',
          userId: 'user-1',
          expiresAt: expect.any(Date),
          ipAddress: '127.0.0.1',
          deviceName: 'MacBook Pro',
          clientType: 'desktop',
          userAgent: 'Mozilla/5.0',
        },
      });
    });
  });
});
