import { RegisterBeneficiarioDto } from './register-beneficiario.dto';

/** Shape del form de registro (camelCase, incluye campos que el backend no soporta todavía). */
export interface RegisterBeneficiarioFormValue {
  email: string;
  password: string;
  confirmarPassword: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  githubUsuario: string;
  linkedin: string;
  cvUrl: string;
}

/** Trim + colapso de espacios internos múltiples a uno solo. */
function limpiarEspacios(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

function aMinuscula(valor: string): string {
  return limpiarEspacios(valor).toLowerCase();
}

function limpiarEmail(valor: string): string {
  return valor.trim().replace(/\s+/g, '').toLowerCase();
}

/**
 * Traduce el form (camelCase) al DTO que espera el backend (snake_case),
 * normalizando cada campo según la política del sistema (trim, colapso de
 * espacios, minúsculas donde corresponde). La contraseña nunca se modifica.
 *
 * "Ciudad" queda cargada en el form pero NO se envía todavía: no hay
 * catálogo de id_ciudad (FK numérica) para resolverla.
 */
export function toRegisterBeneficiarioDto(
  v: RegisterBeneficiarioFormValue,
): RegisterBeneficiarioDto {
  const github = v.githubUsuario
    ? `https://github.com/${aMinuscula(v.githubUsuario)}`
    : undefined;

  return {
    email: limpiarEmail(v.email),
    password: v.password,
    nombre: aMinuscula(v.nombre),
    apellido: aMinuscula(v.apellido),
    dni: v.dni.trim().replace(/\s+/g, ''),
    ...(v.fechaNacimiento ? { fecha_nacimiento: v.fechaNacimiento } : {}),
    ...(v.telefono ? { telefono: limpiarEspacios(v.telefono) } : {}),
    ...(v.direccion ? { direccion: aMinuscula(v.direccion) } : {}),
    ...(github ? { github } : {}),
    ...(v.linkedin ? { linkedin: aMinuscula(v.linkedin) } : {}),
    ...(v.cvUrl ? { cv_url: aMinuscula(v.cvUrl) } : {}),
  };
}
