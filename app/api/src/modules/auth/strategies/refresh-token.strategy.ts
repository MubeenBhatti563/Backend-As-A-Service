import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { Strategy } from 'passport-jwt';
import { RefreshTokenType } from '../types/auth.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-guard',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => {
        return req.cookies?.refreshToken ?? null;
      },
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  validate(req: FastifyRequest, payload: RefreshTokenType) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return { ...payload, refreshToken };
  }
}
