import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './infra/redis/redis.service';
import { RedisSessionStore } from './infra/redis/redis-session.store';
import { DEFAULT_SESSION_TTL_MS } from './modules/auth/constants/session.constants';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api/v1');
  app.useLogger(app.get(Logger));

  const allowedOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:4000,http://127.0.0.1:4000'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  // Validate SESSION_SECRET and fail fast if missing or weak in production
  const sessionSecret = configService.get<string>('SESSION_SECRET');
  if (!sessionSecret || sessionSecret.trim() === '') {
    throw new Error(
      'SESSION_SECRET is missing. Set a cryptographically secure string in your environment.',
    );
  }
  if (process.env.NODE_ENV === 'production' && sessionSecret.length < 32) {
    throw new Error(
      'SESSION_SECRET must be at least 32 characters in production for cryptographic safety.',
    );
  }

  // Cookie configuration driven by environment variables for cross-origin deployment
  const cookieSameSite = (
    configService.get<string>('COOKIE_SAME_SITE') ??
    (process.env.NODE_ENV === 'production' ? 'none' : 'lax')
  ).toLowerCase() as 'lax' | 'strict' | 'none';

  const cookieSecure =
    configService.get<string>('COOKIE_SECURE') !== undefined
      ? configService.get<string>('COOKIE_SECURE') === 'true'
      : process.env.NODE_ENV === 'production' || cookieSameSite === 'none';

  // Swagger/OpenApi for API docs
  const config = new DocumentBuilder()
    .setTitle('AI-Featured Backend-as-a-Service (BaaS) Platform.')
    .setDescription(
      'AI-powered Backend-as-a-Service platform providing authentication, database management, REST APIs, realtime communication, storage, server-side functions, and intelligent backend generation.',
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs', app, document);

  // 1. Fastify Cookie (Required dependency)
  await app.register(fastifyCookie);

  // 2. Fastify Session with RedisStore adapter
  await app.register(fastifySession, {
    secret: sessionSecret,
    cookieName: 'sessionId',
    store: new RedisSessionStore(redisService),
    saveUninitialized: false,
    rolling: false,
    cookie: {
      secure: cookieSecure,
      httpOnly: true,
      sameSite: cookieSameSite,
      maxAge: DEFAULT_SESSION_TTL_MS,
    },
  });

  // workers finish active jobs before exit
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
