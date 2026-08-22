import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';

export interface CreateMentoriaDto {
  titulo: string;
  descripcion?: string;
  requisitos: string;
  duracion_minutos: number;
  id_area: number;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
  id_provincia?: number;
  link_o_canal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MentoriasEmpresaService {
  private http = inject(HttpClient);
  private config = inject(AppConfig);
  private apiUrl = `${this.config.apiUrl}/empresas/mentorias`;

  crearMentoria(mentoria: CreateMentoriaDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, mentoria);
  }
}
