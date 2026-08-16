/** Motivo por el que un beneficiario no puede postularse a una oferta puntual. */
export type MotivoNoDisponible =
  'cerrada' | 'vencida' | 'cupo_completo' | 'ya_postulado';

/** Respuesta de GET /beneficiarios/ofertas-laborales y GET /beneficiarios/ofertas-laborales/:id. */
export interface OfertaLaboralBeneficiarioResponseDto {
  id_servicio: number;
  titulo: string;
  descripcion: string | null;
  empresa: string;
  area: string;
  habilidades: string[];
  tipo_contrato: string | null;
  modalidad: string;
  salario: number | null;
  vacantes: number | null;
  postulantes_actuales: number;
  fecha_limite: Date | null;
  fecha_publicacion: Date;
  estado_publicacion: string;
  match_porcentaje: number;
  puede_postularse: boolean;
  motivo_no_disponible: MotivoNoDisponible | null;
}
