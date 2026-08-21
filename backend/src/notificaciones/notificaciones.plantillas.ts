export type TipoNotificacion =
  | 'POSTULACION_ENVIADA'
  | 'MENTORIA_INSCRIPCION'
  | 'MENTORIA_CANCELACION'
  | 'POSTULACION_RECIBIDA'
  | 'SOLICITUD_APROBADA'
  | 'SOLICITUD_RECHAZADA'
  | 'POSTULACION_CAMBIO_ESTADO';

/** Datos variables que exige la plantilla de cada tipo de notificación. */
export interface DatosPlantilla {
  POSTULACION_ENVIADA: { oferta: string; empresa: string };
  MENTORIA_INSCRIPCION: { mentoria: string };
  MENTORIA_CANCELACION: { mentoria: string };
  POSTULACION_RECIBIDA: { nombre: string; oferta: string };
  SOLICITUD_APROBADA: Record<string, never>;
  SOLICITUD_RECHAZADA: Record<string, never>;
  POSTULACION_CAMBIO_ESTADO: { oferta: string; empresa: string; estado: string };
}

const PLANTILLAS: {
  [K in TipoNotificacion]: (datos: DatosPlantilla[K]) => string;
} = {
  POSTULACION_ENVIADA: (d) => `Te postulaste a "${d.oferta}" en ${d.empresa}.`,
  MENTORIA_INSCRIPCION: (d) =>
    `Te inscribiste a la mentoría "${d.mentoria}".`,
  MENTORIA_CANCELACION: (d) =>
    `Se canceló tu inscripción a "${d.mentoria}".`,
  POSTULACION_RECIBIDA: (d) => `${d.nombre} se postuló a "${d.oferta}".`,
  SOLICITUD_APROBADA: () =>
    'Tu solicitud de habilitación fue aprobada. Ya podés publicar ofertas.',
  SOLICITUD_RECHAZADA: () => 'Tu solicitud de habilitación fue rechazada.',
  POSTULACION_CAMBIO_ESTADO: (d) =>
    `El estado de tu postulación a "${d.oferta}" en ${d.empresa} ha cambiado a: ${d.estado.replace('_', ' ')}.`,
};

/** Arma el texto final de la notificación según su tipo y los datos de la plantilla. */
export function armarMensaje<K extends TipoNotificacion>(
  tipo: K,
  datos: DatosPlantilla[K],
): string {
  return PLANTILLAS[tipo](datos);
}
