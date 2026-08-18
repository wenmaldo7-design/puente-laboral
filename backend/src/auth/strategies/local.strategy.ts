import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import type { JwtPayload, RolUsuario } from '../interfaces/jwt-payload.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<JwtPayload> {
    // rol: la pestaña que el usuario eligió en el login-page. Es opcional
    // (passport-local no lo extrae solo) porque llega en el body crudo,
    // no vía un DTO con ValidationPipe.
    const body = req.body as { rol?: RolUsuario } | undefined;
    const rolEsperado = body?.rol;
    // Vale para cualquier rol; si las credenciales son invalidas o el rol
    // real no coincide con la pestaña elegida, authService lanza
    // UnauthorizedException.
    return this.authService.validateUsuario(email, password, rolEsperado);
  }
}
