/** Espeja OfertaLaboralBeneficiarioResponseDto del backend (GET /beneficiarios/ofertas-laborales). */
export type MotivoNoDisponible = 'cerrada' | 'vencida' | 'cupo_completo' | 'ya_postulado';

export interface OfertaLaboralBeneficiario {
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
  fecha_limite: string | null;
  provincia: string | null;
  fecha_publicacion: string;
  estado_publicacion: string;
  match_porcentaje: number;
  puede_postularse: boolean;
  motivo_no_disponible: MotivoNoDisponible | null;
}

/** Espeja PostulacionResponseDto del backend. */
export interface Postulacion {
  id_postulacion: number;
  id_servicio: number;
  titulo_oferta: string;
  empresa: string;
  fecha_postulacion: string;
  estado_postulacion: string;
  cv_url: string | null;
  carta_presentacion: string | null;
}

export const MENSAJE_NO_DISPONIBLE: Record<MotivoNoDisponible, string> = {
  cerrada: 'Oferta cerrada',
  vencida: 'Oferta vencida',
  cupo_completo: 'Cupo completo',
  ya_postulado: 'Ya estás postulado/a',
};
