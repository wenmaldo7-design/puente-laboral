import { RegisterBeneficiarioDto } from './register-beneficiario.dto';

/** Shape del form de registro (camelCase, incluye campos que el backend no soporta todavía). */
export interface RegisterBeneficiarioFormValue {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  githubUsuario: string;
  cvUrl: string;
}

/**
 * Traduce el form (camelCase) al DTO que espera el backend (snake_case).
 * El ValidationPipe del backend tiene forbidNonWhitelisted:true: si se manda
 * una propiedad que el DTO no declara (cv_url, ciudad), el registro entero
 * falla con 400. Por eso "ciudad" y "cvUrl" quedan cargados en el form pero
 * NO se envían todavía (no hay catálogo de ciudades ni cv_url en el DTO).
 */
export function toRegisterBeneficiarioDto(
  v: RegisterBeneficiarioFormValue,
): RegisterBeneficiarioDto {
  return {
    email: v.email,
    password: v.password,
    nombre: v.nombre,
    apellido: v.apellido,
    dni: v.dni,
    ...(v.fechaNacimiento ? { fecha_nacimiento: v.fechaNacimiento } : {}),
    ...(v.telefono ? { telefono: v.telefono } : {}),
    ...(v.direccion ? { direccion: v.direccion } : {}),
    ...(v.githubUsuario ? { github: `https://github.com/${v.githubUsuario}` } : {}),
  };
}
