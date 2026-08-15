import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { InscripcionMentoria } from '../models/inscripcion-mentoria.model';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

/**
 * El backend todavía no tiene el endpoint de inscripciones a mentorías.
 * Mientras tanto, `inscribirse` guarda el estado en memoria (se pierde al
 * recargar la página) para simular la confirmación sin depender de una API
 * real. La forma de los métodos ya es la que va a tener la versión HTTP.
 */
@Injectable({ providedIn: 'root' })
export class InscripcionesMentorias {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  private readonly inscripciones = new Map<string, InscripcionMentoria>();

  getInscripcionPorMentoria(mentoriaId: string): Observable<InscripcionMentoria | undefined> {
    // return this.http.get<InscripcionMentoria | undefined>(`${this.apiUrl}/mentorias/${mentoriaId}/inscripcion`);
    return of(this.inscripciones.get(mentoriaId));
  }

  inscribirse(mentoriaId: string): Observable<InscripcionMentoria> {
    // return this.http.post<InscripcionMentoria>(`${this.apiUrl}/mentorias/${mentoriaId}/inscripciones`, {});
    const inscripcion: InscripcionMentoria = {
      id: `insc-${mentoriaId}`,
      mentoriaId,
      estado: 'confirmada',
      fechaInscripcion: new Date().toISOString().slice(0, 10),
    };
    this.inscripciones.set(mentoriaId, inscripcion);
    return of(inscripcion);
  }

  darDeBaja(mentoriaId: string): Observable<InscripcionMentoria> {
    // return this.http.patch<InscripcionMentoria>(`${this.apiUrl}/mentorias/${mentoriaId}/inscripcion`, { estado: 'cancelada' });
    const existente = this.inscripciones.get(mentoriaId);
    const inscripcion: InscripcionMentoria = {
      id: existente?.id ?? `insc-${mentoriaId}`,
      mentoriaId,
      estado: 'cancelada',
      fechaInscripcion: existente?.fechaInscripcion ?? new Date().toISOString().slice(0, 10),
    };
    this.inscripciones.set(mentoriaId, inscripcion);
    return of(inscripcion);
  }
}
