/** Respuesta de GET /empresas/ofertas-laborales: oportunidades publicadas por la empresa autenticada. */
export interface OportunidadEmpresaResponseDto {
  id_servicio: number;
  titulo: string;
  tipo_servicio: string;
  estado_publicacion: string;
  modalidad: string | null;
  fecha_publicacion: Date;
  postulaciones_count: number;
  nuevas_postulaciones_count: number;
}
