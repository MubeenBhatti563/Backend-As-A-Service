import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { generateCryptoToken, hashToken } from '@baas/crypto-utils';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  generateRawToken(bytes = 32): string {
    return generateCryptoToken(bytes);
  }

  hashRawToken(rawToken: string): string {
    return hashToken(rawToken);
  }

  async issueVerificationToken(
    userId: string,
    type: TokenType,
    ttlMs: number,
  ): Promise<{ rawToken: string; hashToken: string; expiresAt: Date }> {
    const rawToken = this.generateRawToken();
    const hashed = this.hashRawToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlMs);

    try {
      await this.prisma.$transaction([
        this.prisma.verificationToken.deleteMany({
          where: { userId, type },
        }),
        this.prisma.verificationToken.create({
          data: {
            userId,
            hashToken: hashed,
            type,
            expiresAt,
          },
        }),
      ]);
    } catch {
      await this.prisma.verificationToken.updateMany({
        where: { userId, type },
        data: { hashToken: hashed, expiresAt },
      });
    }

    return { rawToken, hashToken: hashed, expiresAt };
  }

  async consumeVerificationToken(
    rawOrHashedToken: string,
    expectedType: TokenType,
  ): Promise<{ id: string; userId: string }> {
    const hashed =
      rawOrHashedToken.length === 64
        ? rawOrHashedToken
        : this.hashRawToken(rawOrHashedToken);

    const tokenRecord = await this.prisma.verificationToken.findUnique({
      where: { hashToken: hashed },
      select: { id: true, userId: true, type: true, expiresAt: true },
    });

    if (!tokenRecord || tokenRecord.type !== expectedType) {
      throw new BadRequestException(
        expectedType === TokenType.EMAIL_VERIFICATION
          ? 'Invalid or expired verification link'
          : 'Invalid or expired password reset link',
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.verificationToken.deleteMany({
        where: { id: tokenRecord.id },
      });
      throw new BadRequestException(
        expectedType === TokenType.EMAIL_VERIFICATION
          ? 'Verification link has expired. Please request a new one.'
          : 'Password reset link has expired. Please request a new one.',
      );
    }

    return { id: tokenRecord.id, userId: tokenRecord.userId };
  }
}
