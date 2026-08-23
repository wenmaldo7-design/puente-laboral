import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso, CursosFiltros } from '../models/curso.model';

@Injectable({
  providedIn: 'root',
})
export class Cursos {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/cursos';

  getCursos(filtros?: CursosFiltros): Observable<Curso[]> {
    let params = new HttpParams();
    if (filtros?.modalidad) {
      params = params.set('modalidad', filtros.modalidad);
    }
    if (filtros?.provincia) {
      params = params.set('provincia', filtros.provincia);
    }
    return this.http.get<Curso[]>(this.apiUrl, { params });
  }

  inscribirse(cursoId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${cursoId}/inscribirse`, {});
  }

  darseDeBaja(cursoId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${cursoId}/baja`, {});
  }
}
