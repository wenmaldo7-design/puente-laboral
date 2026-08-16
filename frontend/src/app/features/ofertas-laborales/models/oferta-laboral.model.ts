export type ModalidadOferta = 'virtual' | 'presencial';

/** Payload real de POST /empresas/ofertas-laborales (ver CrearOfertaLaboralDto del backend). */
export interface CrearOfertaLaboralDto {
  titulo: string;
  descripcion?: string;
  area: string;
  habilidades: string[];
  tipo_contrato?: string;
  modalidad: ModalidadOferta;
  salario?: number;
  vacantes: number;
  fecha_limite: string;
}

export interface OfertaLaboralCreada {
  id_servicio: number;
  titulo: string;
  descripcion: string | null;
  area: string;
  habilidades: string[];
  tipo_contrato: string | null;
  modalidad: ModalidadOferta;
  salario: number | null;
  vacantes: number | null;
  fecha_limite: string | null;
  fecha_publicacion: string;
  estado_publicacion: string;
}
