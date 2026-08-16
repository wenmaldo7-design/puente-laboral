/** Respuesta de POST /empresas/ofertas-laborales. */
export interface OfertaLaboralResponseDto {
  id_servicio: number;
  titulo: string;
  descripcion: string | null;
  area: string;
  habilidades: string[];
  tipo_contrato: string | null;
  modalidad: string;
  salario: number | null;
  vacantes: number | null;
  fecha_limite: Date | null;
  fecha_publicacion: Date;
  estado_publicacion: string;
}
