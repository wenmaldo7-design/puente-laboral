import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Extractor custom: el token NUNCA viaja en el header Authorization,
 * solo dentro de la cookie firmada `access_token`.
 * req.signedCookies solo existe si cookie-parser se inicializo con
 * el secret correspondiente en main.ts.
 */
const cookieExtractor = (req: Request): string | null => {
  if (req && req.signedCookies) {
    return req.signedCookies['access_token'] ?? null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Lo que se retorna aca queda disponible en req.user
    return payload;
  }
}
