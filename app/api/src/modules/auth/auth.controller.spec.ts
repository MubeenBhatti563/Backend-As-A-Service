import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { InternalServerErrorException } from '@nestjs/common';
import {
  AuthService,
  REMEMBER_ME_TTL_MS,
  SHORT_SESSION_TTL_MS,
} from './auth.service';
import type { FastifyRequest } from 'fastify';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: {
    register: jest.Mock;
    validateCredentials: jest.Mock;
    createSession: jest.Mock;
    resendVerificationEmail: jest.Mock;
    verifyEmail: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
    logout: jest.Mock;
    logoutAll: jest.Mock;
    getMe: jest.Mock;
    getAllSessions: jest.Mock;
    revokeSession: jest.Mock;
    revokeOtherSessions: jest.Mock;
  };

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      validateCredentials: jest.fn(),
      createSession: jest.fn(),
      resendVerificationEmail: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
      getMe: jest.fn(),
      getAllSessions: jest.fn(),
      revokeSession: jest.fn(),
      revokeOtherSessions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call authService.register and return the result', async () => {
      const dto = {
        email: 'user@example.com',
        fullName: 'Jane Doe',
        password: 'Password123!',
      };
      const expectedUser = { id: 'u1', email: dto.email, fullName: dto.fullName };
      authServiceMock.register.mockResolvedValue(expectedUser);

      const result = await controller.registerUser(dto);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('loginUser', () => {
    it('should validate credentials, regenerate session, create session record, and return user', async () => {
      const dto = { email: 'user@example.com', password: 'Password123!' };
      const user = { id: 'user-1', email: 'user@example.com', fullName: 'Jane' };
      authServiceMock.validateCredentials.mockResolvedValue(user);
      authServiceMock.createSession.mockResolvedValue(undefined);

      const mockSession: any = {
        sessionId: 'sess-abc-123',
        sessionStoreId: 'sess-store-123',
        regenerate: jest.fn().mockResolvedValue(undefined),
        options: jest.fn(),
      };

      const mockReq = {
        session: mockSession,
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      } as unknown as FastifyRequest;

      const result = await controller.loginUser(dto, mockReq);

      expect(authServiceMock.validateCredentials).toHaveBeenCalledWith(dto);
      expect(mockSession.regenerate).toHaveBeenCalled();
      expect(mockSession.userId).toBe('user-1');
      expect(mockSession.email).toBe('user@example.com');
      expect(mockSession.options).toHaveBeenCalledWith({
        maxAge: SHORT_SESSION_TTL_MS,
      });
      expect(authServiceMock.createSession).toHaveBeenCalledWith(
        'user-1',
        'sess-store-123',
        expect.objectContaining({
          ipAddress: '127.0.0.1',
        }),
        SHORT_SESSION_TTL_MS,
      );
      expect(result).toEqual(user);
    });

    it('should set remember me maxAge when rememberMe is true', async () => {
      const dto = {
        email: 'user@example.com',
        password: 'Password123!',
        rememberMe: true,
      };
      const user = { id: 'user-1', email: 'user@example.com', fullName: 'Jane' };
      authServiceMock.validateCredentials.mockResolvedValue(user);
      authServiceMock.createSession.mockResolvedValue(undefined);

      const mockSession: any = {
        sessionId: 'sess-abc-123',
        sessionStoreId: 'sess-store-123',
        regenerate: jest.fn().mockResolvedValue(undefined),
        options: jest.fn(),
      };

      const mockReq = {
        session: mockSession,
        ip: '127.0.0.1',
        headers: {},
      } as unknown as FastifyRequest;

      await controller.loginUser(dto, mockReq);

      expect(mockSession.options).toHaveBeenCalledWith({
        maxAge: REMEMBER_ME_TTL_MS,
      });
      expect(authServiceMock.createSession).toHaveBeenCalledWith(
        'user-1',
        'sess-store-123',
        expect.anything(),
        REMEMBER_ME_TTL_MS,
      );
    });

    it('should fail rather than report login success without a session store ID', async () => {
      authServiceMock.validateCredentials.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Jane',
      });

      const mockReq = {
        session: {
          sessionId: 'public-session-id',
          regenerate: jest.fn().mockResolvedValue(undefined),
          options: jest.fn(),
        },
      } as unknown as FastifyRequest;

      await expect(
        controller.loginUser(
          { email: 'user@example.com', password: 'Password123!' },
          mockReq,
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(authServiceMock.createSession).not.toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    it('should call authService.resendVerificationEmail', async () => {
      authServiceMock.resendVerificationEmail.mockResolvedValue({
        message: 'Verification email sent successfully',
      });

      const result = await controller.resendVerification({
        email: 'user@example.com',
      });

      expect(authServiceMock.resendVerificationEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(result.message).toBe('Verification email sent successfully');
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail', async () => {
      authServiceMock.verifyEmail.mockResolvedValue({
        message: 'Email verified successfully!',
      });

      const result = await controller.verifyEmail({
        token: 'token12345678901234567890123456789012',
      });

      expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(
        'token12345678901234567890123456789012',
      );
      expect(result.message).toBe('Email verified successfully!');
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      authServiceMock.forgotPassword.mockResolvedValue({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });

      const result = await controller.forgotPassword({
        email: 'user@example.com',
      });

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(result.message).toContain('If an account exists');
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      authServiceMock.resetPassword.mockResolvedValue({
        message: 'Password has been reset successfully. Please log in with your new password.',
      });

      const result = await controller.resetPassword({
        token: 'token12345678901234567890123456789012',
        password: 'NewStrongPassword123!',
      });

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
        'token12345678901234567890123456789012',
        'NewStrongPassword123!',
      );
      expect(result.message).toContain('Password has been reset successfully');
    });
  });

  describe('logout', () => {
    it('should logout current session and destroy fastify session', async () => {
      authServiceMock.logout.mockResolvedValue(undefined);
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const mockReq = {
        session: {
          sessionStoreId: 'sess-123',
          destroy: mockDestroy,
        },
      } as unknown as FastifyRequest;

      const result = await controller.logout(mockReq);

      expect(authServiceMock.logout).toHaveBeenCalledWith('sess-123');
      expect(mockDestroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  describe('logoutAll', () => {
    it('should logout all sessions for the user and destroy fastify session', async () => {
      authServiceMock.logoutAll.mockResolvedValue(undefined);
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const mockReq = {
        session: {
          destroy: mockDestroy,
        },
      } as unknown as FastifyRequest;

      const result = await controller.logoutAll('user-1', mockReq);

      expect(authServiceMock.logoutAll).toHaveBeenCalledWith('user-1');
      expect(mockDestroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out from all devices' });
    });
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Jane Doe',
        isVerified: true,
      };
      authServiceMock.getMe.mockResolvedValue(user);

      const result = await controller.me('user-1');

      expect(authServiceMock.getMe).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(user);
    });
  });

  describe('getAllSessions', () => {
    it('should delegate to authService.getAllSessions with userId and sessionId', async () => {
      const mockSessions = [
        { id: 'sess-1', userId: 'user-1', isCurrent: true },
      ];
      authServiceMock.getAllSessions.mockResolvedValue(mockSessions);
      const mockReq = {
        session: { sessionId: 'public-session-id', sessionStoreId: 'store-id' },
      } as unknown as FastifyRequest;

      const result = await controller.getAllSessions('user-1', mockReq);

      expect(authServiceMock.getAllSessions).toHaveBeenCalledWith(
        'user-1',
        'store-id',
      );
      expect(result).toEqual(mockSessions);
    });
  });

  describe('revokeSession', () => {
    it('should delegate to authService.revokeSession and destroy session if current', async () => {
      authServiceMock.revokeSession.mockResolvedValue({
        message: 'Session revoked successfully',
      });
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const mockReq = {
        session: { sessionStoreId: 'sess-1', destroy: mockDestroy },
      } as unknown as FastifyRequest;

      const result = await controller.revokeSession(
        'sess-1',
        'user-1',
        mockReq,
      );

      expect(authServiceMock.revokeSession).toHaveBeenCalledWith(
        'user-1',
        'sess-1',
      );
      expect(mockDestroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Session revoked successfully' });
    });
  });

  describe('revokeOtherSessions', () => {
    it('should delegate to authService.revokeOtherSessions', async () => {
      authServiceMock.revokeOtherSessions.mockResolvedValue({
        message: 'All other sessions revoked successfully',
      });
      const mockReq = {
        session: { sessionStoreId: 'sess-current' },
      } as unknown as FastifyRequest;

      const result = await controller.revokeOtherSessions('user-1', mockReq);

      expect(authServiceMock.revokeOtherSessions).toHaveBeenCalledWith(
        'user-1',
        'sess-current',
      );
      expect(result).toEqual({
        message: 'All other sessions revoked successfully',
      });
    });

    it('should throw UnauthorizedException if no currentSessionId is present', async () => {
      const mockReq = {
        session: {},
      } as unknown as FastifyRequest;

      await expect(
        controller.revokeOtherSessions('user-1', mockReq),
      ).rejects.toThrow('No active session found');
    });
  });
});
