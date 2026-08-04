export type TipoOportunidadOrg = 'empleo' | 'curso' | 'mentoria';
export type EstadoOportunidad = 'activa' | 'pausada' | 'cerrada';

export interface MetricaOrgResumen {
  id: string;
  valor: number | string;
  etiqueta: string;
  tendencia?: string;
}

export interface OportunidadPublicada {
  id: string;
  titulo: string;
  tipo: TipoOportunidadOrg;
  estado: EstadoOportunidad;
  postulacionesCount: number;
  nuevasPostulacionesCount: number;
  fechaPublicacion: string;
  ubicacion: string;
}

export interface PostulanteReciente {
  id: string;
  nombre: string;
  avatarIniciales: string;
  oportunidadTitulo: string;
  matchPorcentaje: number;
  fechaPostulacion: string;
  estado: 'nueva' | 'en_revision' | 'entrevistado' | 'aceptado' | 'descartado';
}

export interface FiltroOportunidadOrg {
  id: 'todas' | TipoOportunidadOrg | EstadoOportunidad;
  etiqueta: string;
}

export const FILTROS_OPORTUNIDAD_ORG: FiltroOportunidadOrg[] = [
  { id: 'todas', etiqueta: 'Todas las publicaciones' },
  { id: 'activa', etiqueta: 'Activas' },
  { id: 'empleo', etiqueta: 'Empleos' },
  { id: 'curso', etiqueta: 'Cursos' },
  { id: 'mentoria', etiqueta: 'Mentorías' },
  { id: 'pausada', etiqueta: 'Pausadas' },
];

export interface CrearOportunidadDto {
  titulo: string;
  tipo: TipoOportunidadOrg;
  ubicacion: string;
  descripcion?: string;
  modalidad?: 'remoto' | 'hibrido' | 'presencial';
}

