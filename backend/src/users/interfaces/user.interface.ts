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
