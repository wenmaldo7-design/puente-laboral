import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InscripcionMentoria } from '../models/inscripcion-mentoria.model';

/**
 * El backend todavía no tiene el endpoint de inscripciones a mentorías.
 * Mientras tanto, `inscribirse` guarda el estado en memoria (se pierde al
 * recargar la página) para simular la confirmación sin depender de una API
 * real. La forma de los métodos ya es la que va a tener la versión HTTP.
 */
@Injectable({ providedIn: 'root' })
export class InscripcionesMentorias {
  private readonly inscripciones = new Map<string, InscripcionMentoria>();

  getInscripcionPorMentoria(mentoriaId: string): Observable<InscripcionMentoria | undefined> {
    return of(this.inscripciones.get(mentoriaId));
  }

  inscribirse(mentoriaId: string): Observable<InscripcionMentoria> {
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
