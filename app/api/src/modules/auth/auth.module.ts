import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { SessionAuthGuard } from './guards/session.guard';
import { EmailModule } from '../../infra/email/email.module';
import { CustomThrottlerGuard } from './guards/throttler-msg.guard';
import { TokenService } from './services/token.service';

@Module({
  imports: [EmailModule],
  providers: [
    AuthService,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
