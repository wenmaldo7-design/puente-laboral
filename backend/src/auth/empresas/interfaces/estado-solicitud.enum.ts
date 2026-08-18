/**
 * Estados posibles de una SOLICITUDES_HABILITACION_EMPRESAS.
 * Los valores coinciden 1:1 con la columna `nombre` de ESTADOS_SOLICITUDES
 * (ver prisma/seed.ts), para no comparar el estado contra strings sueltos
 * en ningún punto del código.
 */
export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

const VALORES_ESTADO_SOLICITUD: readonly string[] =
  Object.values(EstadoSolicitud);

/** Type guard: narrowea el `nombre` (string) de ESTADOS_SOLICITUDES a EstadoSolicitud. */
export function esEstadoSolicitud(nombre: string): nombre is EstadoSolicitud {
  return VALORES_ESTADO_SOLICITUD.includes(nombre);
}
