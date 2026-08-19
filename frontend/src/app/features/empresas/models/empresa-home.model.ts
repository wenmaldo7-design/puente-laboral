export type EstadoOportunidad = 'activa' | 'pausada' | 'cerrada';

export interface MetricaEmpresaResumen {
  id: string;
  valor: number | string;
  etiqueta: string;
}

/**
 * Solo servicios de tipo oferta_laboral tienen soporte real de creación
 * hoy (cursos/mentorias no tienen endpoint de publicación para empresas
 * todavía). ubicacion no existe en el schema: se usa modalidad.
 */
export interface OportunidadPublicada {
  id: number;
  titulo: string;
  tipoServicio: string;
  estado: EstadoOportunidad;
  modalidad: string | null;
  postulacionesCount: number;
  nuevasPostulacionesCount: number;
  fechaPublicacion: string;
}

export type EstadoPostulacion = 'pendiente' | 'en_proceso' | 'entrevistado' | 'aceptada' | 'rechazada';

/** estado espeja el nombre real de ESTADOS_POSTULACIONES (pendiente/en_proceso/entrevistado/aceptada/rechazada), sin inventar estados intermedios. */
export interface PostulanteReciente {
  id: number;
  nombre: string;
  avatarIniciales: string;
  oportunidadTitulo: string;
  idOportunidad: number;
  matchPorcentaje: number;
  fechaPostulacion: string;
  estado: string;
}

export interface FiltroOportunidadEmpresa {
  id: 'todas' | EstadoOportunidad;
  etiqueta: string;
}

export const FILTROS_OPORTUNIDAD_EMPRESA: FiltroOportunidadEmpresa[] = [
  { id: 'todas', etiqueta: 'Todas las publicaciones' },
  { id: 'activa', etiqueta: 'Activas' },
  { id: 'pausada', etiqueta: 'Pausadas' },
  { id: 'cerrada', etiqueta: 'Cerradas' },
];
