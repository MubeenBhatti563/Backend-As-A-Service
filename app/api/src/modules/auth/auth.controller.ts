import '@fastify/cookie';
import '@fastify/session';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
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
import { Throttle } from '@nestjs/throttler';
import { ThrottlerMessage } from './decorators/throttler.decorator';

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
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ThrottlerMessage('Too many requests! try login again after 5 minutes!')
  @Throttle({ default: { limit: 5, ttl: 5 * 60 * 1000 } })
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
    const user = await this.authService.validateCredentials(dto);

    if (req.session?.regenerate) {
      await req.session.regenerate();
    }
    if (req.session) {
      req.session.userId = user.id;
      req.session.email = user.email;
    }

    const uaString = (req.headers['user-agent'] as string) || '';
    const ua = new UAParser(uaString).getResult();

    const sessionInfo: SessionDeviceType = {
      ipAddress: req.ip,
      deviceName:
        ua.device.model || ua.device.vendor || ua.device.type || 'Unknown',
      clientType: ua.device.type || 'desktop',
      userAgent: uaString,
    };

    if (req.session?.sessionId) {
      await this.authService.createSession(
        user.id,
        req.session.sessionId,
        sessionInfo,
      );
    }

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
    if (req.session?.sessionId) {
      await this.authService.logout(req.session.sessionId);
    }
    if (req.session?.destroy) {
      await req.session.destroy();
    }
    return { message: 'Logged out' };
  }

  @Get('me')
  async me(@GetUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}
