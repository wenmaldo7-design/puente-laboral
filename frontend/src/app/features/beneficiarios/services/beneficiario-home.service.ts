import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ActualizacionPostulacion } from '../models/beneficiario-home.model';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

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
 * Métricas de postulaciones y "Recomendado para vos" ya salen de datos
 * reales (Postulaciones/OfertasLaborales, ver home-beneficiario-page.ts).
 * El endpoint de actualizaciones todavía no existe en el backend: se
 * expone un mock con la misma forma (Observable) que va a tener la
 * respuesta HTTP real, para que reemplazarlo por `this.http.get(...)` no
 * requiera tocar el componente que lo consume.
 */
@Injectable({ providedIn: 'root' })
export class BeneficiarioHomeService {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  getUltimasActualizaciones(): Observable<ActualizacionPostulacion[]> {
    // return this.http.get<ActualizacionPostulacion[]>(`${this.apiUrl}/beneficiarios/me/actualizaciones`);
    return of(MOCK_ACTUALIZACIONES);
  }
}
