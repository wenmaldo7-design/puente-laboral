import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Mentoria } from '../models/mentoria.model';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

const MOCK_MENTORIAS: Mentoria[] = [
  {
    id: 'ment-1',
    titulo: 'Primeros pasos en programación web',
    descripcion:
      'Charla introductoria sobre HTML, CSS y cómo armar tu primer sitio web, pensada para quienes recién arrancan.',
    mentorNombre: 'Lucía Fernández',
    mentorIniciales: 'LF',
    fecha: '2026-08-20',
    horaInicio: '18:00',
    modalidad: 'virtual',
    linkOCanal: 'https://meet.google.com/abc-defg-hij',
    matchPorcentaje: 92,
  },
  {
    id: 'ment-2',
    titulo: 'Cómo armar tu CV para tu primer empleo',
    descripcion: 'Taller práctico para armar un currículum claro y adaptarlo a distintas búsquedas laborales.',
    mentorNombre: 'Martín Ríos',
    mentorIniciales: 'MR',
    fecha: '2026-08-22',
    horaInicio: '10:00',
    modalidad: 'presencial',
    matchPorcentaje: 78,
  },
  {
    id: 'ment-3',
    titulo: 'Introducción a la atención al cliente',
    descripcion: 'Herramientas y buenas prácticas para desempeñarte en atención al público, presencial o telefónica.',
    mentorNombre: 'Carla Gómez',
    mentorIniciales: 'CG',
    fecha: '2026-08-25',
    horaInicio: '16:30',
    modalidad: 'virtual',
    linkOCanal: 'https://zoom.us/j/123456789',
  },
  {
    id: 'ment-4',
    titulo: 'Herramientas de oficina: Excel desde cero',
    descripcion: 'Planilla de cálculo desde cero: fórmulas básicas, tablas y cómo ordenar información de trabajo.',
    mentorNombre: 'Diego Torres',
    mentorIniciales: 'DT',
    fecha: '2026-08-27',
    horaInicio: '14:00',
    modalidad: 'presencial',
    matchPorcentaje: 85,
  },
  {
    id: 'ment-5',
    titulo: 'Preparate para tu primera entrevista laboral',
    descripcion: 'Simulacro de entrevista y consejos concretos para presentarte con confianza frente a un empleador.',
    mentorNombre: 'Valentina Ruiz',
    mentorIniciales: 'VR',
    fecha: '2026-08-29',
    horaInicio: '19:00',
    modalidad: 'virtual',
    linkOCanal: 'https://meet.google.com/xyz-uvwx-rst',
    matchPorcentaje: 88,
  },
];

/**
 * El backend todavía no tiene los endpoints de mentorías. Estos métodos
 * devuelven mocks con la misma forma (Observable) que va a tener la
 * respuesta HTTP real, para que reemplazarlos por `this.http.get(...)` no
 * requiera tocar los componentes que los consumen.
 */
@Injectable({ providedIn: 'root' })
export class Mentorias {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  getMentorias(): Observable<Mentoria[]> {
    // return this.http.get<Mentoria[]>(`${this.apiUrl}/mentorias`);
    return of(MOCK_MENTORIAS);
  }

  getMentoriaPorId(id: string): Observable<Mentoria | undefined> {
    // return this.http.get<Mentoria>(`${this.apiUrl}/mentorias/${id}`);
    return of(MOCK_MENTORIAS.find((mentoria) => mentoria.id === id));
  }
}
