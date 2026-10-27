import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { SessionAuthGuard } from './guards/session.guard';
import { EmailModule } from '../../infra/email/email.module';

@Module({
  imports: [JwtModule, EmailModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
