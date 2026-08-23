import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  CrearOportunidadDto,
  MetricaOrgResumen,
  OportunidadPublicada,
  PostulanteReciente,
} from '../models/organizacion-home.model';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

let MOCK_METRICAS: MetricaOrgResumen[] = [
  {
    id: 'm-1',
    valor: '3',
    etiqueta: 'Oportunidades Activas',
    tendencia: '+1 este mes',
  },
  {
    id: 'm-2',
    valor: '24',
    etiqueta: 'Postulaciones Totales',
    tendencia: '+12 esta semana',
  },
  {
    id: 'm-3',
    valor: '5',
    etiqueta: 'En Proceso de Entrevista',
    tendencia: undefined,
  },
  {
    id: 'm-4',
    valor: '92%',
    etiqueta: 'Tasa de Match Promedio',
    tendencia: '+4% vs mes anterior',
  },
];

let MOCK_OPORTUNIDADES: OportunidadPublicada[] = [
  {
    id: 'op-1',
    titulo: 'Desarrollador Trainee Frontend (Angular)',
    tipo: 'empleo',
    estado: 'activa',
    postulacionesCount: 18,
    nuevasPostulacionesCount: 4,
    fechaPublicacion: '2026-07-28',
    ubicacion: 'Córdoba / Remoto',
  },
  {
    id: 'op-2',
    titulo: 'Taller de Introducción a Base de Datos y SQL',
    tipo: 'curso',
    estado: 'activa',
    postulacionesCount: 22,
    nuevasPostulacionesCount: 6,
    fechaPublicacion: '2026-07-30',
    ubicacion: 'Online Sincrónico',
  },
  {
    id: 'op-3',
    titulo: 'Mentoría en Habilidades Blandas e Inserción Laboral',
    tipo: 'mentoria',
    estado: 'activa',
    postulacionesCount: 8,
    nuevasPostulacionesCount: 2,
    fechaPublicacion: '2026-08-01',
    ubicacion: 'Córdoba Capital',
  },
  {
    id: 'op-4',
    titulo: 'Asistente de Soporte Técnico Jr',
    tipo: 'empleo',
    estado: 'pausada',
    postulacionesCount: 15,
    nuevasPostulacionesCount: 0,
    fechaPublicacion: '2026-07-15',
    ubicacion: 'Híbrido - Córdoba',
  },
  {
    id: 'op-5',
    titulo: 'Pasantía en QA Manual y Automatizado',
    tipo: 'empleo',
    estado: 'cerrada',
    postulacionesCount: 30,
    nuevasPostulacionesCount: 0,
    fechaPublicacion: '2026-06-20',
    ubicacion: 'Córdoba Capital',
  },
];

const MOCK_POSTULANTES: PostulanteReciente[] = [
  {
    id: 'post-1',
    nombre: 'Camila Morales',
    avatarIniciales: 'CM',
    oportunidadTitulo: 'Desarrollador Trainee Frontend (Angular)',
    matchPorcentaje: 95,
    fechaPostulacion: '2026-08-03',
    estado: 'nueva',
  },
  {
    id: 'post-2',
    nombre: 'Lucas Benítez',
    avatarIniciales: 'LB',
    oportunidadTitulo: 'Desarrollador Trainee Frontend (Angular)',
    matchPorcentaje: 88,
    fechaPostulacion: '2026-08-02',
    estado: 'en_revision',
  },
  {
    id: 'post-3',
    nombre: 'Valentina Gómez',
    avatarIniciales: 'VG',
    oportunidadTitulo: 'Taller de Introducción a Base de Datos',
    matchPorcentaje: 91,
    fechaPostulacion: '2026-08-02',
    estado: 'nueva',
  },
  {
    id: 'post-4',
    nombre: 'Mateo Roldán',
    avatarIniciales: 'MR',
    oportunidadTitulo: 'Mentoría en Habilidades Blandas',
    matchPorcentaje: 82,
    fechaPostulacion: '2026-07-31',
    estado: 'entrevistado',
  },
];

@Injectable({ providedIn: 'root' })
export class OrganizacionHomeService {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  getMetricas(): Observable<MetricaOrgResumen[]> {
    return of(MOCK_METRICAS);
  }

  getOportunidadesPublicadas(): Observable<OportunidadPublicada[]> {
    return of(MOCK_OPORTUNIDADES);
  }

  crearOportunidad(dto: CrearOportunidadDto): Observable<OportunidadPublicada> {
    const nueva: OportunidadPublicada = {
      id: `op-${Date.now()}`,
      titulo: dto.titulo.trim(),
      tipo: dto.tipo,
      estado: 'activa',
      postulacionesCount: 0,
      nuevasPostulacionesCount: 0,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      ubicacion: dto.ubicacion.trim(),
    };

    MOCK_OPORTUNIDADES = [nueva, ...MOCK_OPORTUNIDADES];
    const oportunidadMetrica = MOCK_METRICAS.find(m => m.id === 'm-1');
    if (oportunidadMetrica) {
      oportunidadMetrica.valor = (Number(oportunidadMetrica.valor) + 1).toString();
    }
    return of(nueva);
  }

  getPostulantesRecientes(): Observable<PostulanteReciente[]>{
    return of(MOCK_POSTULANTES);
  }
}