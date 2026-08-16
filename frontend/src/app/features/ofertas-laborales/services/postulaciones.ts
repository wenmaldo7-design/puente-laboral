import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { Postulacion } from '../models/postulacion.model';

@Injectable({
  providedIn: 'root',
})
export class Postulaciones {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  /** POST /beneficiarios/ofertas-laborales/:id/postulaciones. */
  postularme(idServicio: number): Observable<Postulacion> {
    return this.http.post<Postulacion>(
      `${this.config.apiUrl}/beneficiarios/ofertas-laborales/${idServicio}/postulaciones`,
      {},
    );
  }

  /** GET /beneficiarios/postulaciones: postulaciones del beneficiario autenticado. */
  misPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.config.apiUrl}/beneficiarios/postulaciones`);
  }
}
