/** Respuesta de GET /beneficiarios/cursos, GET /beneficiarios/cursos/:id y GET /beneficiarios/mis-cursos. */
export interface CursoResponseDto {
  id: number;
  titulo: string;
  descripcion: string | null;
  area: string;
  provincia: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  cupos: number | null;
  cuposDisponibles: number | null;
  modalidad: string;
  requisitos: string | null;
  otorgaCertificado: boolean;
  profesor: string | null;
  matchPorcentaje: number;
  inscrito: boolean;
}
