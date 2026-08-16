import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { RolUsuario } from '../interfaces/jwt-payload.interface';
import type { AuthRequest } from '../interfaces/auth-request.interface';

/**
 * Autorización por rol. Se aplica DESPUÉS de JwtAuthGuard en la misma
 * cadena (@UseGuards(JwtAuthGuard, RolesGuard)): asume que request.user
 * ya viene poblado como JwtPayload.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<
      RolUsuario[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    return rolesRequeridos.includes(user.rol);
  }
}
