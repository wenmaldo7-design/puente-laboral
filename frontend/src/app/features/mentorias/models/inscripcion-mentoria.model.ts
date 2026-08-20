export type EstadoInscripcion = 'inscrito' | 'cancelado';

export interface InscripcionMentoria {
  id: number;
  mentoriaId: number;
  tituloMentoria: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
  fechaActualizacion: string | null;
}
