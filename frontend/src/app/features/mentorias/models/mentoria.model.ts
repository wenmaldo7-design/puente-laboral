export type ModalidadMentoria = 'presencial' | 'virtual';

export interface Mentoria {
  id: string;
  titulo: string;
  descripcion: string;
  mentorNombre: string;
  mentorIniciales: string;
  fecha: string;
  horaInicio: string;
  modalidad: ModalidadMentoria;
  linkOCanal?: string;
  matchPorcentaje?: number;
}

export interface FiltroModalidad {
  id: 'todas' | ModalidadMentoria;
  etiqueta: string;
}

export const FILTROS_MODALIDAD: FiltroModalidad[] = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'presencial', etiqueta: 'Presencial' },
  { id: 'virtual', etiqueta: 'Virtual' },
];
