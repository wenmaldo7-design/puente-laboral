import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { CrearOfertaLaboralDto, OfertaLaboralCreada } from '../models/oferta-laboral.model';
import { OfertaLaboralBeneficiario } from '../models/postulacion.model';

interface CatalogoItemResponseDto {
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class OfertasLaborales {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  /** POST /empresas/ofertas-laborales: crea SERVICIOS + OFERTAS_LABORALES + OFERTAS_HABILIDADES en una transacción. */
  crear(dto: CrearOfertaLaboralDto): Observable<OfertaLaboralCreada> {
    return this.http.post<OfertaLaboralCreada>(
      `${this.config.apiUrl}/empresas/ofertas-laborales`,
      dto,
    );
  }

  /** GET /beneficiarios/ofertas-laborales: ofertas compatibles con el perfil del beneficiario autenticado. */
  getCompatibles(): Observable<OfertaLaboralBeneficiario[]> {
    return this.http.get<OfertaLaboralBeneficiario[]>(
      `${this.config.apiUrl}/beneficiarios/ofertas-laborales`,
    );
  }

  /** GET /beneficiarios/ofertas-laborales/:id: detalle, visible aunque no matchee o esté cerrada/vencida. */
  getDetalle(idServicio: number): Observable<OfertaLaboralBeneficiario> {
    return this.http.get<OfertaLaboralBeneficiario>(
      `${this.config.apiUrl}/beneficiarios/ofertas-laborales/${idServicio}`,
    );
  }

  getCatalogoAreas(): Observable<string[]> {
    return this.http
      .get<CatalogoItemResponseDto[]>(`${this.config.apiUrl}/catalogos/areas-interes`)
      .pipe(map((items) => items.map((i) => i.nombre)));
  }

  getCatalogoHabilidades(): Observable<string[]> {
    return this.http
      .get<CatalogoItemResponseDto[]>(`${this.config.apiUrl}/catalogos/habilidades`)
      .pipe(map((items) => items.map((i) => i.nombre)));
  }

  getCatalogoTiposContrato(): Observable<string[]> {
    return this.http
      .get<CatalogoItemResponseDto[]>(`${this.config.apiUrl}/catalogos/tipos-contrato`)
      .pipe(map((items) => items.map((i) => i.nombre)));
  }

  getCatalogoProvincias(): Observable<string[]> {
    return this.http
      .get<CatalogoItemResponseDto[]>(`${this.config.apiUrl}/catalogos/provincias`)
      .pipe(map((items) => items.map((i) => i.nombre)));
  }
}
