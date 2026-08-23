/** Respuesta de POST y DELETE /beneficiarios/cursos/:id/inscripciones. */
export interface InscripcionCursoResponseDto {
  id: number;
  idServicio: number;
  tituloCurso: string;
  estadoCurso: string;
  fechaInscripcion: Date;
  fechaActualizacion: Date | null;
}
