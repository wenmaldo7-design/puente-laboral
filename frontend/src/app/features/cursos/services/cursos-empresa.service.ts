import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppConfig } from '../../../core/config/app-config';

export interface CreateCursoDto {
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
    // Si el backend no tiene el endpoint, lo simulamos para que el flujo UI funcione.
    // En un entorno real se haria: return this.http.post<any>(${this.config.apiUrl}/empresas/cursos, dto);
    return of({ success: true }).pipe(delay(1000));
  }
}
