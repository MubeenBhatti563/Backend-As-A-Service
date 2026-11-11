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
      delete: jest.Mock;
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
      findFirst: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
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
    sendAccountDeletedNotice: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      platformUser: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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
        findFirst: jest.fn(),
        delete: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
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
      sendAccountDeletedNotice: jest.fn().mockResolvedValue(undefined),
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
      prismaMock.platformUser.findUnique.mockResolvedValue({
        id: 'existing-id',
      });

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
      rememberMe: true,
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

  describe('changePassword', () => {
    const currentPassword = 'CurrentPassword123!';
    const newPassword = 'NewPassword456!';

    it('should update the password, revoke other sessions, and invalidate reset tokens', async () => {
      const currentPasswordHash = await argon2.hash(currentPassword);
      prismaMock.platformUser.findUnique.mockResolvedValue({
        passwordHash: currentPasswordHash,
      });
      prismaMock.session.findMany.mockResolvedValue([
        { id: 'sess-other-1' },
        { id: 'sess-other-2' },
      ]);
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await service.changePassword(
        'user-1',
        'sess-current',
        currentPassword,
        newPassword,
      );

      expect(result.message).toContain('Password updated successfully');
      expect(redisMock.del).toHaveBeenCalledWith(
        'sess:sess-other-1',
        'sess:sess-other-2',
      );
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.$transaction.mock.calls[0][0]).toHaveLength(3);
      expect(prismaMock.platformUser.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: expect.any(String) },
      });
      const savedHash = prismaMock.platformUser.update.mock.calls[0][0].data
        .passwordHash;
      expect(await argon2.verify(savedHash, newPassword)).toBe(true);
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'sess-current' } },
      });
      expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: TokenType.PASSWORD_RESET },
      });
    });

    it('should not change credentials when the current password is incorrect', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        passwordHash: await argon2.hash(currentPassword),
      });

      await expect(
        service.changePassword(
          'user-1',
          'sess-current',
          'WrongPassword123!',
          newPassword,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaMock.platformUser.update).not.toHaveBeenCalled();
      expect(prismaMock.session.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('should reject a user that no longer exists', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(
          'missing-user',
          'sess-current',
          currentPassword,
          newPassword,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.platformUser.update).not.toHaveBeenCalled();
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

  describe('deleteAccount', () => {
    it('revokes sessions, deletes the account, then queues a deletion notice', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        email: 'user@example.com',
      });
      prismaMock.session.findMany.mockResolvedValue([
        { id: 'sess-1' },
        { id: 'sess-2' },
      ]);
      prismaMock.platformUser.delete.mockResolvedValue({ id: 'user-1' });

      await expect(service.deleteAccount('user-1')).resolves.toEqual({
        message: 'Account deleted successfully',
      });

      expect(redisMock.del).toHaveBeenCalledWith('sess:sess-1', 'sess:sess-2');
      expect(prismaMock.platformUser.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(emailMock.sendAccountDeletedNotice).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(prismaMock.platformUser.delete.mock.invocationCallOrder[0]).toBeLessThan(
        emailMock.sendAccountDeletedNotice.mock.invocationCallOrder[0],
      );
    });

    it('does not delete the account when Redis session revocation fails', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        email: 'user@example.com',
      });
      prismaMock.session.findMany.mockResolvedValue([{ id: 'sess-1' }]);
      redisMock.del.mockRejectedValueOnce(new Error('Redis unavailable'));

      await expect(service.deleteAccount('user-1')).rejects.toThrow(
        'Redis unavailable',
      );
      expect(prismaMock.platformUser.delete).not.toHaveBeenCalled();
      expect(emailMock.sendAccountDeletedNotice).not.toHaveBeenCalled();
    });

    it('succeeds if the confirmation email cannot be queued after deletion', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue({
        email: 'user@example.com',
      });
      prismaMock.session.findMany.mockResolvedValue([]);
      prismaMock.platformUser.delete.mockResolvedValue({ id: 'user-1' });
      emailMock.sendAccountDeletedNotice.mockRejectedValueOnce(
        new Error('Queue unavailable'),
      );

      await expect(service.deleteAccount('user-1')).resolves.toEqual({
        message: 'Account deleted successfully',
      });
      expect(prismaMock.platformUser.delete).toHaveBeenCalled();
    });

    it('does not delete or notify when the account does not exist', async () => {
      prismaMock.platformUser.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount('missing-user')).rejects.toThrow(
        'Account not found',
      );
      expect(prismaMock.platformUser.delete).not.toHaveBeenCalled();
      expect(emailMock.sendAccountDeletedNotice).not.toHaveBeenCalled();
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

    it('should create session record with custom TTL when specified', async () => {
      prismaMock.session.create.mockResolvedValue({ id: 'sess-2' });
      const customTtl = 30 * 24 * 60 * 60 * 1000;
      const before = Date.now();

      await service.createSession(
        'user-1',
        'sess-2',
        { ipAddress: '127.0.0.1' },
        customTtl,
      );

      expect(prismaMock.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'sess-2',
          userId: 'user-1',
          expiresAt: expect.any(Date),
        }),
      });

      const calledArg = prismaMock.session.create.mock.calls[0][0].data;
      const expiresAt = new Date(calledArg.expiresAt).getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + customTtl);
    });
  });

  describe('getAllSessions, revokeSession, and revokeOtherSessions', () => {
    const userId = 'user-1';
    const now = new Date('2026-11-08T12:00:00Z');
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);

    it('should return all active sessions and mark current session', async () => {
      const mockSessions = [
        {
          id: 'sess-current',
          userId,
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome',
          deviceName: 'MacBook',
          clientType: 'desktop',
          createdAt: now,
          lastActiveAt: now,
          expiresAt: future,
        },
        {
          id: 'sess-other',
          userId,
          ipAddress: '192.168.1.1',
          userAgent: 'Firefox',
          deviceName: 'Ubuntu',
          clientType: 'desktop',
          createdAt: now,
          lastActiveAt: now,
          expiresAt: future,
        },
      ];

      prismaMock.session.findMany.mockResolvedValueOnce(mockSessions);

      const result = await service.getAllSessions(userId, 'sess-current');

      expect(prismaMock.session.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          expiresAt: { gt: expect.any(Date) },
        },
        orderBy: { lastActiveAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].isCurrent).toBe(true);
      expect(result[1].isCurrent).toBe(false);
      expect(prismaMock.session.update).toHaveBeenCalledWith({
        where: { id: 'sess-current' },
        data: { lastActiveAt: expect.any(Date) },
      });
      expect(result[0].lastActiveAt).not.toEqual(now.toISOString());
    });

    it('does not fabricate a session record when the current session is missing', async () => {
      prismaMock.session.findMany.mockResolvedValueOnce([]);

      const result = await service.getAllSessions(userId, 'sess-not-recorded');

      expect(result).toEqual([]);
      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });

    it('should revoke a specific session', async () => {
      prismaMock.session.findFirst.mockResolvedValueOnce({
        id: 'sess-to-revoke',
        userId,
      });
      prismaMock.session.delete.mockResolvedValueOnce({ id: 'sess-to-revoke' });

      const result = await service.revokeSession(userId, 'sess-to-revoke');

      expect(prismaMock.session.findFirst).toHaveBeenCalledWith({
        where: { id: 'sess-to-revoke', userId },
      });
      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: 'sess-to-revoke' },
      });
      expect(redisMock.del).toHaveBeenCalledWith('sess:sess-to-revoke');
      expect(result.message).toBe('Session revoked successfully');
    });

    it('should throw NotFoundException when revoking non-existent session', async () => {
      prismaMock.session.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.revokeSession(userId, 'non-existent'),
      ).rejects.toThrow('Session not found or already revoked');
    });

    it('does not remove the database record if Redis revocation fails', async () => {
      prismaMock.session.findFirst.mockResolvedValueOnce({
        id: 'sess-to-revoke',
        userId,
      });
      redisMock.del.mockRejectedValueOnce(new Error('Redis unavailable'));

      await expect(
        service.revokeSession(userId, 'sess-to-revoke'),
      ).rejects.toThrow('Redis unavailable');
      expect(prismaMock.session.delete).not.toHaveBeenCalled();
    });

    it('should revoke all other sessions except current', async () => {
      prismaMock.session.findMany.mockResolvedValueOnce([
        { id: 'sess-other-1' },
        { id: 'sess-other-2' },
      ]);
      prismaMock.session.deleteMany.mockResolvedValueOnce({ count: 2 });

      const result = await service.revokeOtherSessions(userId, 'sess-current');

      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
          id: { not: 'sess-current' },
        },
      });
      expect(redisMock.del).toHaveBeenCalledWith(
        'sess:sess-other-1',
        'sess:sess-other-2',
      );
      expect(result.message).toBe('All other sessions revoked successfully');
    });
  });
});
