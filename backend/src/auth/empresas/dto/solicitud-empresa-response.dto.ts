import { EstadoSolicitud } from '../interfaces/estado-solicitud.enum';

/**
 * Shape que devuelve el backend al listar/consultar solicitudes de
 * habilitación de empresa. Usado para tipar la tabla del panel admin.
 *
 * `estado` viaja como EstadoSolicitud (derivado de ESTADOS_SOLICITUDES.nombre)
 * en vez del id_estado_solicitud crudo, para que el frontend nunca compare
 * contra un número ni contra un string suelto.
 */
export interface SolicitudEmpresaResponseDto {
  id_solicitud: number;
  razon_social: string;
  cuit: string;
  email_contacto: string;
  telefono_contacto: string | null;
  descripcion: string | null;
  documentacion_url: string | null;
  fecha_solicitud: Date;
  fecha_revision: Date | null;
  motivo_rechazo: string | null;
  estado: EstadoSolicitud;
  id_admin_revisor: number | null;
}
