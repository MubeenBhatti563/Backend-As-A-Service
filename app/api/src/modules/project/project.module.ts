import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { DB_QUEUE } from '../../workers/db-workers/db.constants';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { RedisModule } from '../../infra/redis/redis.module';
import { UsageTelemetryService } from './usage-telemetry.service';
import { UsageTelemetryInterceptor } from './usage-telemetry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    BullModule.registerQueue({
      name: DB_QUEUE,
    }),
  ],
  providers: [ProjectService, UsageTelemetryService, { provide: APP_INTERCEPTOR, useClass: UsageTelemetryInterceptor }],
  controllers: [ProjectController],
})
export class ProjectModule {}
