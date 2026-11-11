import '@fastify/cookie';
import '@fastify/session';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RegisterDto } from './dtos/register.dto';
import {
  AuthService,
  REMEMBER_ME_TTL_MS,
  SHORT_SESSION_TTL_MS,
} from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Public } from './decorators/public.decorator';
import type { SessionDeviceType } from './types/auth.types';
import { UAParser } from 'ua-parser-js';
import { GetUser } from './decorators/get-user.decorator';
import {
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dtos/resend-verification.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ThrottlerMessage } from './decorators/throttler.decorator';
import { ResponseMessage } from '../../common';
import { ChangePasswordDto } from './dtos/change-password.dto';

declare module 'fastify' {
  interface Session {
    userId?: string;
    email?: string;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('User registered successfully')
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @ResponseMessage('Login successful')
  @Post('login')
  @ThrottlerMessage('Too many requests! try login again after 5 minutes!')
  @Throttle({ default: { limit: 5, ttl: 5 * 60 * 1000 } })
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
    const user = await this.authService.validateCredentials(dto);

    if (!req.session?.regenerate) {
      throw new InternalServerErrorException(
        'Unable to establish an authenticated session',
      );
    }
    await req.session.regenerate();
    if (
      !req.session.sessionId ||
      !req.session.sessionStoreId ||
      !req.session.options
    ) {
      throw new InternalServerErrorException(
        'Unable to establish an authenticated session',
      );
    }

    req.session.userId = user.id;
    req.session.email = user.email;

    const uaString = (req.headers['user-agent'] as string) || '';
    const ua = new UAParser(uaString).getResult();

    const sessionInfo: SessionDeviceType = {
      ipAddress: req.ip,
      deviceName:
        ua.device.model || ua.device.vendor || ua.device.type || 'Unknown',
      clientType: ua.device.type || 'desktop',
      userAgent: uaString,
    };

    const sessionTtlMs = dto.rememberMe
      ? REMEMBER_ME_TTL_MS
      : SHORT_SESSION_TTL_MS;

    req.session.options({ maxAge: sessionTtlMs });

    await this.authService.createSession(
      user.id,
      req.session.sessionStoreId,
      sessionInfo,
      sessionTtlMs,
    );

    return user;
  }

  @Public()
  @ThrottlerMessage(
    'You can only request one email verification every 2 minutes.',
  )
  @Throttle({ default: { limit: 1, ttl: 120 * 1000 } })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @ThrottlerMessage('Too many request, wait for 2 minutes to send next!')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ResendVerificationDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @ThrottlerMessage('Too many password change attempts. Try again in 15 minutes.')
  @Throttle({ default: { limit: 3, ttl: 15 * 60 * 1000 } })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @GetUser('userId') userId: string,
    @Req() req: FastifyRequest,
  ) {
    const currentSessionId = req.session?.sessionStoreId;
    if (!currentSessionId) {
      throw new UnauthorizedException('No active session found');
    }

    return this.authService.changePassword(
      userId,
      currentSessionId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @GetUser('userId') userId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.authService.logoutAll(userId);
    if (req.session?.destroy) {
      await req.session.destroy();
    }
    return { message: 'Logged out from all devices' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: FastifyRequest) {
    if (req.session?.sessionStoreId) {
      await this.authService.logout(req.session.sessionStoreId);
    }
    if (req.session?.destroy) {
      await req.session.destroy();
    }
    return { message: 'Logged out' };
  }

  @ThrottlerMessage('Too many account deletion attempts. Try again later.')
  @Throttle({ default: { limit: 2, ttl: 15 * 60 * 1000 } })
  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @GetUser('userId') userId: string,
    @Req() req: FastifyRequest,
  ) {
    const result = await this.authService.deleteAccount(userId);
    if (req.session?.destroy) {
      await req.session.destroy();
    }
    return result;
  }

  @SkipThrottle()
  @ResponseMessage('User profile retrieved successfully')
  @Get('me')
  async me(@GetUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }

  @Get('get-sessions')
  @HttpCode(HttpStatus.OK)
  async getAllSessions(
    @GetUser('userId') userId: string,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.getAllSessions(userId, req.session?.sessionStoreId);
  }

  @Post('revoke-session/:sessionId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @GetUser('userId') userId: string,
    @Req() req: FastifyRequest,
  ) {
    const result = await this.authService.revokeSession(userId, sessionId);
    if (req.session?.sessionStoreId === sessionId && req.session?.destroy) {
      await req.session.destroy();
    }
    return result;
  }

  @Post('revoke-other-sessions')
  @HttpCode(HttpStatus.OK)
  async revokeOtherSessions(
    @GetUser('userId') userId: string,
    @Req() req: FastifyRequest,
  ) {
    const currentSessionStoreId = req.session?.sessionStoreId;
    if (!currentSessionStoreId) {
      throw new UnauthorizedException('No active session found');
    }
    return this.authService.revokeOtherSessions(
      userId,
      currentSessionStoreId,
    );
  }
}
