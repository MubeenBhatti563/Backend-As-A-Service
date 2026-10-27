import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import {
  AccessTokenType,
  RefreshTokenType,
  SessionDeviceType,
} from './types/auth.types';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infra/redis/redis.service';
import { SESSION_PREFIX } from '../../infra/redis/redis-session.store';
import { EmailService } from '../../infra/email/email.service';
import { ThrottlerException } from '@nestjs/throttler';
import { TokenType } from '@prisma/client';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateCryptoToken(byteLength: number = 32): string {
    return crypto.randomBytes(byteLength).toString('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  private async getAccessToken(sub: string, email: string) {
    const accessTokenPayload: AccessTokenType = {
      sub,
      email,
      type: 'accessToken',
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      algorithm: 'HS256',
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });

    return accessToken;
  }

  private async getRefreshToken(sub: string, email: string) {
    const refreshTokenPayload: RefreshTokenType = {
      sub,
      email,
      type: 'refreshToken',
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      algorithm: 'HS256',
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return refreshToken;
  }

  private async jwtTokens(sub: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      await this.getAccessToken(sub, email),
      await this.getRefreshToken(sub, email),
    ]);

    return { accessToken, refreshToken };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prismaService.platformUser.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const rawToken = this.generateCryptoToken();
    const hashToken = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prismaService.$transaction([
      this.prismaService.verificationToken.deleteMany({
        where: { userId: user.id, type: 'EMAIL_VERIFICATION' },
      }),
      this.prismaService.verificationToken.create({
        data: {
          hashToken,
          expiresAt,
          type: 'EMAIL_VERIFICATION',
          userId: user.id,
        },
      }),
    ]);

    await this.emailService.sendVerificationLink(email, rawToken);

    return { message: 'Verification email sent successfully' };
  }

  async register(dto: RegisterDto) {
    const email = await this.prismaService.platformUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (email) throw new ConflictException('This email is already in use!');

    const passwordHash = await this.hashPassword(dto.password);

    const { passwordHash: _, ...user } = await this.prismaService.$transaction(
      async (tx) => {
        const user = await tx.platformUser.create({
          data: {
            email: dto.email.toLowerCase(),
            fullName: dto.fullName,
            passwordHash,
          },
        });

        const rawToken = this.generateCryptoToken();
        const hashToken = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const verifyEmail = await tx.verificationToken.create({
          data: {
            expiresAt,
            hashToken,
            type: 'EMAIL_VERIFICATION',
            userId: user.id,
          },
        });

        await this.emailService.sendVerificationLink(user.email, rawToken);

        return user;
      },
    );

    return user;
  }

  async validateCredentials(dto: LoginDto) {
    const user = await this.prismaService.platformUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user)
      throw new UnauthorizedException('Email or password is not correct!');

    const isMatch = await this.verifyPassword(dto.password, user.passwordHash);

    if (!isMatch)
      throw new UnauthorizedException('Email or password is not correct!');

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in.',
      );
    }

    const { passwordHash, ...safeUser } = user;

    return safeUser;
  }

  async createSession(
    userId: string,
    sessionId: string,
    info: SessionDeviceType,
  ) {
    await this.prismaService.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        ipAddress: info.ipAddress ? String(info.ipAddress) : undefined,
        deviceName: info.deviceName ? String(info.deviceName) : undefined,
        clientType: info.clientType ? String(info.clientType) : undefined,
        userAgent: info.userAgent ? String(info.userAgent) : undefined,
      },
    });
  }

  async verifyEmail(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new BadRequestException('Verification token is required');
    }

    const hashToken = this.hashToken(rawToken);
    const tokenRecord = await this.prismaService.verificationToken.findUnique({
      where: { hashToken },
    });

    if (!tokenRecord || tokenRecord.type !== TokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prismaService.verificationToken.delete({
        where: { id: tokenRecord.id },
      });

      throw new BadRequestException(
        'Verification link has expired. Please request a new one.',
      );
    }

    await this.prismaService.$transaction([
      this.prismaService.platformUser.update({
        where: { id: tokenRecord.userId },
        data: {
          isVerified: true,
          updatedAt: new Date(),
        },
      }),

      this.prismaService.verificationToken.delete({
        where: { id: tokenRecord.id },
      }),
    ]);

    return { message: 'Email verified successfully!' };
  }

  async resetPassword() {}

  async getMe(userId: string) {
    const user = await this.prismaService.platformUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async logout(sessionId: string) {
    await this.prismaService.session.deleteMany({ where: { id: sessionId } });
  }

  async logoutAll(userId: string) {
    const sessions = await this.prismaService.session.findMany({
      where: { userId },
      select: { id: true },
    });

    if (sessions.length > 0) {
      await this.redisService.del(
        ...sessions.map((s) => `${SESSION_PREFIX}${s.id}`),
      );
    }
    await this.prismaService.session.deleteMany({ where: { userId } });
  }
}
