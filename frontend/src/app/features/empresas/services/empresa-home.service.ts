import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import {
  EstadoOportunidad,
  MetricaEmpresaResumen,
  OportunidadPublicada,
  PostulanteReciente,
} from '../models/empresa-home.model';

/** Espeja OportunidadEmpresaResponseDto del backend (GET /empresas/ofertas-laborales). */
interface OportunidadEmpresaResponseDto {
  id_servicio: number;
  titulo: string;
  tipo_servicio: string;
  estado_publicacion: string;
  modalidad: string | null;
  fecha_publicacion: string;
  postulaciones_count: number;
  nuevas_postulaciones_count: number;
}

/** Espeja EmpresaMetricasResponseDto del backend (GET /empresas/metricas). */
interface EmpresaMetricasResponseDto {
  oportunidades_activas: number;
  postulaciones_totales: number;
  postulaciones_pendientes: number;
  match_promedio: number | null;
}

/** Espeja PostulanteRecienteResponseDto del backend (GET /empresas/postulaciones/recientes). */
interface PostulanteRecienteResponseDto {
  id_postulacion: number;
  beneficiario_nombre: string;
  avatar_iniciales: string;
  oferta_titulo: string;
  id_servicio: number;
  match_porcentaje: number;
  fecha_postulacion: string;
  estado_postulacion: string;
}

function aOportunidadPublicada(dto: OportunidadEmpresaResponseDto): OportunidadPublicada {
  return {
    id: dto.id_servicio,
    titulo: dto.titulo,
    tipoServicio: dto.tipo_servicio,
    estado: dto.estado_publicacion as EstadoOportunidad,
    modalidad: dto.modalidad,
    postulacionesCount: dto.postulaciones_count,
    nuevasPostulacionesCount: dto.nuevas_postulaciones_count,
    fechaPublicacion: dto.fecha_publicacion.slice(0, 10),
  };
}

function aPostulanteReciente(dto: PostulanteRecienteResponseDto): PostulanteReciente {
  return {
    id: dto.id_postulacion,
    nombre: dto.beneficiario_nombre,
    avatarIniciales: dto.avatar_iniciales,
    oportunidadTitulo: dto.oferta_titulo,
    idOportunidad: dto.id_servicio,
    matchPorcentaje: dto.match_porcentaje,
    fechaPostulacion: dto.fecha_postulacion.slice(0, 10),
    estado: dto.estado_postulacion,
  };
}

function aMetricas(dto: EmpresaMetricasResponseDto): MetricaEmpresaResumen[] {
  return [
    { id: 'oportunidades-activas', valor: dto.oportunidades_activas, etiqueta: 'Oportunidades Activas' },
    { id: 'postulaciones-totales', valor: dto.postulaciones_totales, etiqueta: 'Postulaciones Totales' },
    { id: 'postulaciones-pendientes', valor: dto.postulaciones_pendientes, etiqueta: 'Postulaciones Pendientes' },
    {
      id: 'match-promedio',
      valor: dto.match_promedio !== null ? `${dto.match_promedio}%` : '-',
      etiqueta: 'Match Promedio de Postulantes',
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class EmpresaHomeService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  getMetricas(): Observable<MetricaEmpresaResumen[]> {
    return this.http
      .get<EmpresaMetricasResponseDto>(`${this.config.apiUrl}/empresas/metricas`)
      .pipe(map(aMetricas));
  }

  getOportunidadesPublicadas(): Observable<OportunidadPublicada[]> {
    return this.http
      .get<OportunidadEmpresaResponseDto[]>(`${this.config.apiUrl}/empresas/ofertas-laborales`)
      .pipe(map((items) => items.map(aOportunidadPublicada)));
  }

  getPostulantesRecientes(): Observable<PostulanteReciente[]> {
    return this.http
      .get<PostulanteRecienteResponseDto[]>(`${this.config.apiUrl}/empresas/postulaciones/recientes`)
      .pipe(map((items) => items.map(aPostulanteReciente)));
  }
}
