export type ModalidadMentoria = 'presencial' | 'virtual' | 'hibrida';

export interface Mentoria {
  id: number;
  titulo: string;
  descripcion: string;
  area: string;
  mentorNombre: string;
  mentorIniciales: string;
  fecha: string;
  horaInicio: string;
  modalidad: ModalidadMentoria;
  linkOCanal?: string;
  inscrito: boolean;
  provincia: string | null;
}

export interface FiltroModalidad {
  id: 'todas' | ModalidadMentoria;
  etiqueta: string;
}

export const FILTROS_MODALIDAD: FiltroModalidad[] = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'presencial', etiqueta: 'Presencial' },
  { id: 'virtual', etiqueta: 'Virtual' },
  { id: 'hibrida', etiqueta: 'Híbrida' },
];
