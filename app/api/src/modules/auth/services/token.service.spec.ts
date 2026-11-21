import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { TokenType } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('TokenService', () => {
  let service: TokenService;
  let prismaMock: {
    verificationToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      verificationToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: jest.fn().mockImplementation((actions) => Promise.all(actions)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe('issueVerificationToken', () => {
    it('should generate token, hash it, and persist via transaction', async () => {
      const result = await service.issueVerificationToken(
        'user-1',
        TokenType.EMAIL_VERIFICATION,
        3600000,
      );

      expect(result.rawToken).toHaveLength(64);
      expect(result.hashToken).toHaveLength(64);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should gracefully update existing token if conflict occurs', async () => {
      prismaMock.$transaction.mockRejectedValueOnce(new Error('Unique constraint'));

      const result = await service.issueVerificationToken(
        'user-1',
        TokenType.PASSWORD_RESET,
        1800000,
      );

      expect(result.rawToken).toBeDefined();
      expect(prismaMock.verificationToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: TokenType.PASSWORD_RESET },
        data: { hashToken: result.hashToken, expiresAt: result.expiresAt },
      });
    });
  });

  describe('consumeVerificationToken', () => {
    it('should consume and return token metadata for valid active token', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValueOnce({
        id: 'tok-1',
        userId: 'user-1',
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + 60000),
      });

      const result = await service.consumeVerificationToken(
        'a'.repeat(64),
        TokenType.EMAIL_VERIFICATION,
      );

      expect(result).toEqual({ id: 'tok-1', userId: 'user-1' });
    });

    it('should throw BadRequestException if token type mismatches', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValueOnce({
        id: 'tok-1',
        userId: 'user-1',
        type: TokenType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(
        service.consumeVerificationToken('a'.repeat(64), TokenType.EMAIL_VERIFICATION),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete and throw BadRequestException if token is expired', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValueOnce({
        id: 'tok-expired',
        userId: 'user-1',
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() - 5000),
      });

      await expect(
        service.consumeVerificationToken('a'.repeat(64), TokenType.EMAIL_VERIFICATION),
      ).rejects.toThrow(/expired/);

      expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { id: 'tok-expired' },
      });
    });
  });
});
