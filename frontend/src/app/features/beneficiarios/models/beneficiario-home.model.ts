export type TipoOportunidad = 'empleo' | 'curso' | 'mentoria';

export interface Oportunidad {
  id: string;
  titulo: string;
  organizacion: string;
  matchPorcentaje: number;
  tipo: TipoOportunidad;
}

export interface MetricaResumen {
  etiqueta: string;
  valor: number;
}

export interface ActualizacionPostulacion {
  id: string;
  mensaje: string;
  fecha: string;
}

export interface FiltroOportunidad {
  id: 'todo' | TipoOportunidad;
  etiqueta: string;
}

export const FILTROS_OPORTUNIDAD: FiltroOportunidad[] = [
  { id: 'todo', etiqueta: 'Todo' },
  { id: 'empleo', etiqueta: 'Empleo' },
  { id: 'curso', etiqueta: 'Cursos' },
  { id: 'mentoria', etiqueta: 'Mentorías' },
];
