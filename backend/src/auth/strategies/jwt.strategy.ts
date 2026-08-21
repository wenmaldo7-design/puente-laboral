import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../database/prisma.service';

/**
 * Extractor custom: el token NUNCA viaja en el header Authorization,
 * solo dentro de la cookie firmada `access_token`.
 * req.signedCookies solo existe si cookie-parser se inicializo con
 * el secret correspondiente en main.ts.
 */
const cookieExtractor = (req: Request): string | null => {
  const token: unknown = req?.signedCookies?.['access_token'];
  return typeof token === 'string' ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Validamos contra la base de datos para asegurar que el usuario
    // no haya sido borrado ni desactivado despues de emitir el token.
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: payload.sub },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario invalido o inactivo');
    }

    return payload;
  }
}
