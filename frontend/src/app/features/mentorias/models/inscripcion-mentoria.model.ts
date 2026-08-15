export type EstadoInscripcion = 'pendiente' | 'confirmada' | 'cancelada';

export interface InscripcionMentoria {
  id: string;
  mentoriaId: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
}
