import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { EstadoInscripcion, InscripcionMentoria } from '../models/inscripcion-mentoria.model';

/** Espeja InscripcionResponseDto del backend. */
interface InscripcionResponseDto {
  id_inscripcion: number;
  id_servicio: number;
  titulo_mentoria: string;
  estado_mentoria: string;
  fecha_inscripcion: string;
  fecha_actualizacion: string | null;
}

function aInscripcion(dto: InscripcionResponseDto): InscripcionMentoria {
  return {
    id: dto.id_inscripcion,
    mentoriaId: dto.id_servicio,
    tituloMentoria: dto.titulo_mentoria,
    estado: dto.estado_mentoria as EstadoInscripcion,
    fechaInscripcion: dto.fecha_inscripcion,
    fechaActualizacion: dto.fecha_actualizacion,
  };
}

@Injectable({ providedIn: 'root' })
export class InscripcionesMentorias {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/beneficiarios`;

  inscribirse(mentoriaId: number): Observable<InscripcionMentoria> {
    return this.http
      .post<InscripcionResponseDto>(`${this.baseUrl}/mentorias/${mentoriaId}/inscripciones`, {})
      .pipe(map(aInscripcion));
  }

  darDeBaja(mentoriaId: number): Observable<InscripcionMentoria> {
    return this.http
      .delete<InscripcionResponseDto>(`${this.baseUrl}/mentorias/${mentoriaId}/inscripciones`)
      .pipe(map(aInscripcion));
  }
}
