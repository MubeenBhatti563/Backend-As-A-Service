import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './infra/redis/redis.service';
import { RedisSessionStore } from './infra/redis/redis-session.store';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api/v1');
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  // Swagger/OpenApi for API docs
  const config = new DocumentBuilder()
    .setTitle('AI-Featured Backend-as-a-Service (BaaS) Platform.')
    .setDescription(
      'AI-powered Backend-as-a-Service platform providing authentication, database management, REST APIs, realtime communication, storage, server-side functions, and intelligent backend generation.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs', app, document);

  // 1. Fastify Cookie (Required dependency)
  await app.register(fastifyCookie);

  // 2. Fastify Session with RedisStore adapter
  await app.register(fastifySession, {
    secret: configService.getOrThrow<string>('SESSION_SECRET'),
    cookieName: 'sessionId',
    store: new RedisSessionStore(redisService),
    saveUninitialized: false,
    rolling: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
