import { CrearSolicitudEmpresaDto } from './solicitud-habilitacion.model';

/** Shape del form público de solicitud de habilitación (todo string, como cualquier form). */
export interface CrearSolicitudEmpresaFormValue {
  razon_social: string;
  cuit: string;
  email_contacto: string;
  password: string;
  confirmarPassword: string;
  telefono_contacto: string;
  descripcion: string;
  documentacion_url: string;
}

/** Trim + colapso de espacios internos múltiples a uno solo. */
function limpiarEspacios(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

function limpiarEmail(valor: string): string {
  return valor.trim().replace(/\s+/g, '').toLowerCase();
}

/**
 * Traduce el form al DTO que espera el backend, normalizando cada campo
 * (trim + colapso de espacios). Razón social y descripción mantienen el
 * formato/mayúsculas ingresados por el usuario. La URL de documentación
 * solo se recorta en los bordes: su contenido no se altera.
 *
 * El ValidationPipe del backend tiene forbidNonWhitelisted:true, y los
 * campos opcionales solo se tratan como "ausentes" si son undefined (una
 * fila vacía "" no lo es para class-validator) — por eso se omiten a mano
 * en vez de mandar el form completo.
 */
export function toCrearSolicitudEmpresaDto(
  v: CrearSolicitudEmpresaFormValue,
): CrearSolicitudEmpresaDto {
  const descripcion = limpiarEspacios(v.descripcion);
  const documentacionUrl = v.documentacion_url.trim();

  return {
    razon_social: limpiarEspacios(v.razon_social),
    cuit: limpiarEspacios(v.cuit),
    email_contacto: limpiarEmail(v.email_contacto),
    password: v.password,
    ...(v.telefono_contacto
      ? { telefono_contacto: limpiarEspacios(v.telefono_contacto) }
      : {}),
    ...(descripcion ? { descripcion } : {}),
    ...(documentacionUrl ? { documentacion_url: documentacionUrl } : {}),
  };
}
