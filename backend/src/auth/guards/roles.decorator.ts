import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../interfaces/jwt-payload.interface';

export const ROLES_KEY = 'roles';

/** Marca un endpoint como accesible solo para los roles indicados (usar junto a RolesGuard). */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
