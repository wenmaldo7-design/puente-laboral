/** Respuesta de POST .../postulaciones y GET /beneficiarios/postulaciones. */
export interface PostulacionResponseDto {
  id_postulacion: number;
  id_servicio: number;
  titulo_oferta: string;
  empresa: string;
  fecha_postulacion: Date;
  estado_postulacion: string;
  cv_url: string | null;
  carta_presentacion: string | null;
}
