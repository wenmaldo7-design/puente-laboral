/** Respuesta de GET /empresas/postulaciones/recientes. */
export interface PostulanteRecienteResponseDto {
  id_postulacion: number;
  beneficiario_nombre: string;
  avatar_iniciales: string;
  oferta_titulo: string;
  id_servicio: number;
  match_porcentaje: number;
  fecha_postulacion: Date;
  estado_postulacion: string;
}
