import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';

export interface CreateCursoDto {
  id_area: number;
  titulo: string;
  descripcion: string;
  cupos_totales: number;
  fecha: string;
  modalidad: string;
  provincia?: string;
}

@Injectable({ providedIn: 'root' })
export class CursosEmpresaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  crearCurso(dto: CreateCursoDto): Observable<any> {
    return this.http.post<any>(`${this.config.apiUrl}/empresas/cursos`, dto);
  }
}
