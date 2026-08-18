export type TipoNotificacion =
  | 'POSTULACION_ENVIADA'
  | 'MENTORIA_INSCRIPCION'
  | 'MENTORIA_CANCELACION'
  | 'POSTULACION_RECIBIDA'
  | 'SOLICITUD_APROBADA'
  | 'SOLICITUD_RECHAZADA';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  fechaEnvio: string;
  leida: boolean;
}
