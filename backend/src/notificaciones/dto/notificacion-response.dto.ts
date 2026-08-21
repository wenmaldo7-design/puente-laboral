/** Respuesta de GET /notificaciones y de los PATCH que marcan como leída. */
export interface NotificacionResponseDto {
  id: number;
  tipo: string;
  mensaje: string;
  fecha_envio: Date;
  leida: boolean;
}
