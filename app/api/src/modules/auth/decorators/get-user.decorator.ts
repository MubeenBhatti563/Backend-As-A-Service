import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import '../types/session.types';

type UserSessionType = {
  userId?: string;
  email?: string;
};

export const GetUser = createParamDecorator(
  (
    data: keyof UserSessionType,
    ctx: ExecutionContext,
  ): string | undefined | UserSessionType => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    return data === 'userId'
      ? req.session.userId
      : data === 'email'
        ? req.session.email
        : { userId: req.session.userId, email: req.session.email };
  },
);
