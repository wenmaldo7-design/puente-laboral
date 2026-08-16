import { CrearOfertaLaboralDto, ModalidadOferta } from './oferta-laboral.model';

/** Forma cruda del FormGroup de publicar-oferta-page (ver PublicarOfertaPage.form). */
export interface PublicarOfertaFormValue {
  titulo: string;
  descripcion: string;
  area: string;
  tipo_contrato: string;
  modalidad: ModalidadOferta | '';
  salario: number | null;
  vacantes: number | null;
  fecha_limite: string;
  habilidades: string[];
}

export function toCrearOfertaLaboralDto(raw: PublicarOfertaFormValue): CrearOfertaLaboralDto {
  return {
    titulo: raw.titulo.trim(),
    ...(raw.descripcion.trim() && { descripcion: raw.descripcion.trim() }),
    area: raw.area,
    habilidades: raw.habilidades,
    ...(raw.tipo_contrato && { tipo_contrato: raw.tipo_contrato }),
    modalidad: raw.modalidad as ModalidadOferta,
    ...(raw.salario !== null && { salario: raw.salario }),
    vacantes: raw.vacantes as number,
    fecha_limite: raw.fecha_limite,
  };
}
