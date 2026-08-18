/**
 * Espeja el enum EstadoSolicitud del backend
 * (backend/src/auth/empresas/interfaces/estado-solicitud.enum.ts).
 */
export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

/** Espeja CrearSolicitudEmpresaDto del backend (form público de solicitud). */
export interface CrearSolicitudEmpresaDto {
  razon_social: string;
  cuit: string;
  email_contacto: string;
  password: string;
  telefono_contacto?: string;
  descripcion?: string;
  documentacion_url?: string;
}

/** Espeja SolicitudEmpresaResponseDto del backend. */
export interface SolicitudEmpresaResponseDto {
  id_solicitud: number;
  razon_social: string;
  cuit: string;
  email_contacto: string;
  telefono_contacto: string | null;
  descripcion: string | null;
  documentacion_url: string | null;
  fecha_solicitud: string;
  fecha_revision: string | null;
  motivo_rechazo: string | null;
  estado: EstadoSolicitud;
  id_admin_revisor: number | null;
}

/**
 * Espeja ListarSolicitudesQueryDto del backend. Todos los campos son
 * opcionales porque el backend les define un valor por defecto.
 */
export interface ListarSolicitudesQueryDto {
  estado?: EstadoSolicitud;
  page?: number;
  limit?: number;
}

/** Espeja SolicitudesPaginadasResponseDto del backend. */
export interface SolicitudesPaginadasResponseDto {
  data: SolicitudEmpresaResponseDto[];
  total: number;
  page: number;
  limit: number;
}

/** Espeja RechazarSolicitudDto del backend. */
export interface RechazarSolicitudDto {
  motivo_rechazo: string;
}
