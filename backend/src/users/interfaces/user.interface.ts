import { Prisma } from '@prisma/client';

/**
 * USUARIO con sus 3 relaciones de rol incluidas. Como cada usuario tiene
 * a lo sumo una fila poblada (beneficiarios/empresas/administradores),
 * esto alcanza para resolver el rol real sin duplicar la query por rol.
 */
export type UsuarioConRoles = Prisma.usuariosGetPayload<{
  include: { beneficiarios: true; empresas: true; administradores: true };
}>;

/**
 * Representacion "limpia" de un beneficiario para exponer en las
 * respuestas HTTP. Nunca debe incluir password_hash.
 */
export interface BeneficiarioSafe {
  id_usuario: number;
  email: string;
  activo: boolean;
  fecha_registro: Date;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: Date | null;
  telefono: string | null;
  direccion: string | null;
  id_ciudad: number | null;
  linkedin: string | null;
  github: string | null;
  cv_url: string | null;
}
