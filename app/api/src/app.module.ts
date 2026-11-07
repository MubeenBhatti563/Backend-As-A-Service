import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infra/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from './infra/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './infra/email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { RedisService } from './infra/redis/redis.service';
import { AllExceptionsFilter, TransformInterceptor } from './common';
import { ProjectModule } from './modules/project/project.module';
import { BullModule } from '@nestjs/bullmq';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          port: Number(configService.get('REDIS_PORT', 6380)),
          host: configService.get('REDIS_HOST', 'localhost'),
          password: configService.get('REDIS_PASSWORD'),
          tls: configService.get('REDIS_TLS') === 'true' ? {} : undefined,
        },
        defaultJobOptions: {
          removeOnComplete: { count: 1000, age: 24 * 3600 },
          removeOnFail: { count: 5000, age: 7 * 24 * 3600 },
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => {
        return {
          throttlers: [
            {
              name: 'default',
              ttl: 60000,
              limit: 100,
            },
          ],
          storage: new ThrottlerStorageRedisService(redisService.getClient()),
        };
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        serializers: {
          req(req: { id: string | number; method: string; url: string }) {
            return { id: req.id, method: req.method, url: req.url };
          },
          res(res: { statusCode: number }) {
            return { statusCode: res.statusCode };
          },
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'MM/DD/YYYY, h:MM:ss TT',
                  messageFormat: '[{context}] {msg}',
                  ignore: 'pid,hostname,context',
                },
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    RedisModule,
    AuthModule,
    EmailModule,
    ProjectModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
