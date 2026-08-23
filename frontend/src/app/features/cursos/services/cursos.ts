import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { Curso } from '../models/curso.model';

/** Espeja CursoResponseDto del backend. */
interface CursoResponseDto {
  id: number;
  titulo: string;
  descripcion: string | null;
  area: string;
  provincia: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  cupos: number | null;
  cuposDisponibles: number | null;
  modalidad: string;
  requisitos: string | null;
  otorgaCertificado: boolean;
  profesor: string | null;
  matchPorcentaje: number;
  inscrito: boolean;
}

function aCurso(dto: CursoResponseDto): Curso {
  return {
    id: dto.id,
    titulo: dto.titulo,
    descripcion: dto.descripcion ?? '',
    area: dto.area,
    provincia: dto.provincia,
    fechaInicio: dto.fechaInicio ?? '',
    fechaFin: dto.fechaFin,
    cupos: dto.cupos,
    cuposDisponibles: dto.cuposDisponibles,
    modalidad: dto.modalidad,
    requisitos: dto.requisitos,
    otorgaCertificado: dto.otorgaCertificado,
    profesor: dto.profesor ?? 'Profesor asignado',
    matchPorcentaje: dto.matchPorcentaje,
    inscrito: dto.inscrito,
  };
}

@Injectable({ providedIn: 'root' })
export class Cursos {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/beneficiarios`;

  getCursos(): Observable<Curso[]> {
    return this.http
      .get<CursoResponseDto[]>(`${this.baseUrl}/cursos`)
      .pipe(map((dtos) => dtos.map(aCurso)));
  }

  getCursoPorId(id: number): Observable<Curso> {
    return this.http
      .get<CursoResponseDto>(`${this.baseUrl}/cursos/${id}`)
      .pipe(map(aCurso));
  }

  getMisCursos(): Observable<Curso[]> {
    return this.http
      .get<CursoResponseDto[]>(`${this.baseUrl}/mis-cursos`)
      .pipe(map((dtos) => dtos.map(aCurso)));
  }

  inscribirse(cursoId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/cursos/${cursoId}/inscripciones`, {});
  }

  darseDeBaja(cursoId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/cursos/${cursoId}/inscripciones`);
  }
}
