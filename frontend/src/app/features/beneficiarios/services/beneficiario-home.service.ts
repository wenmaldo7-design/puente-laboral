import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  ActualizacionPostulacion,
  MetricaResumen,
  Oportunidad,
} from '../models/beneficiario-home.model';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

const MOCK_METRICAS: MetricaResumen[] = [
  { etiqueta: 'Postulaciones', valor: 8 },
  { etiqueta: 'En curso', valor: 3 },
  { etiqueta: 'Notificaciones', valor: 2 },
];

const MOCK_OPORTUNIDADES: Oportunidad[] = [
  {
    id: 'op-1',
    titulo: 'Asistente administrativo/a',
    organizacion: 'Fundación Crecer',
    matchPorcentaje: 92,
    tipo: 'empleo',
  },
  {
    id: 'op-2',
    titulo: 'Curso de Excel intermedio',
    organizacion: 'Instituto Aprender',
    matchPorcentaje: 85,
    tipo: 'curso',
  },
  {
    id: 'op-3',
    titulo: 'Mentoría en búsqueda laboral',
    organizacion: 'Red de Mentores',
    matchPorcentaje: 78,
    tipo: 'mentoria',
  },
];

const MOCK_ACTUALIZACIONES: ActualizacionPostulacion[] = [
  {
    id: 'act-1',
    mensaje: 'Tu postulación a Asistente administrativo/a pasó a Entrevista',
    fecha: '2026-08-01',
  },
  {
    id: 'act-2',
    mensaje: 'Tu postulación a Curso de Excel intermedio fue Aceptada',
    fecha: '2026-07-28',
  },
];

/**
 * Los endpoints de oportunidades, postulaciones y notificaciones todavía no
 * existen en el backend. Mientras tanto se exponen datos mock con la misma
 * forma (Observable) que va a tener la respuesta HTTP real, para que
 * reemplazar cada método por una llamada a `this.http.get(...)` no requiera
 * tocar el componente que los consume.
 */
@Injectable({ providedIn: 'root' })
export class BeneficiarioHomeService {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  getMetricas(): Observable<MetricaResumen[]> {
    // return this.http.get<MetricaResumen[]>(`${this.apiUrl}/beneficiarios/me/metricas`);
    return of(MOCK_METRICAS);
  }

  getOportunidadesRecomendadas(): Observable<Oportunidad[]> {
    // return this.http.get<Oportunidad[]>(`${this.apiUrl}/beneficiarios/me/oportunidades-recomendadas`);
    return of(MOCK_OPORTUNIDADES);
  }

  getUltimasActualizaciones(): Observable<ActualizacionPostulacion[]> {
    // return this.http.get<ActualizacionPostulacion[]>(`${this.apiUrl}/beneficiarios/me/actualizaciones`);
    return of(MOCK_ACTUALIZACIONES);
  }
}
