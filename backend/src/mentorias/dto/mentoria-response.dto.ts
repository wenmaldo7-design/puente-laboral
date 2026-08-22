/** Respuesta de GET /beneficiarios/mentorias, GET /beneficiarios/mentorias/:id y GET /beneficiarios/mis-mentorias. */
export interface MentoriaResponseDto {
  id_servicio: number;
  titulo: string;
  descripcion: string | null;
  area: string;
  fecha: Date | null;
  hora_inicio: Date | null;
  modalidad: string;
  link_o_canal: string | null;
  mentor: string | null;
  inscrito: boolean;
  provincia: string | null;
}
