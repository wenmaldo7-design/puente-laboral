export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  area: string;
  provincia: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  cupos: number | null;
  cuposDisponibles: number | null;
  modalidad: string;
  requisitos: string | null;
  otorgaCertificado: boolean;
  profesor: string;
  matchPorcentaje: number;
  inscrito: boolean;
}
