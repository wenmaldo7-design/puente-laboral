/** Respuesta de POST y DELETE /beneficiarios/mentorias/:id/inscripciones. */
export interface InscripcionResponseDto {
  id_inscripcion: number;
  id_servicio: number;
  titulo_mentoria: string;
  fecha_inscripcion: Date;
  estado_mentoria: string;
  fecha_actualizacion: Date | null;
}
