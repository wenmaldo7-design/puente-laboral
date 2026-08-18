import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import {
  CrearSolicitudEmpresaDto,
  ListarSolicitudesQueryDto,
  RechazarSolicitudDto,
  SolicitudEmpresaResponseDto,
  SolicitudesPaginadasResponseDto,
} from '../models/solicitud-habilitacion.model';

/**
 * Consume /solicitudes-empresas (Fase 2 y 3 del backend): alta pública de
 * la solicitud y las acciones del panel admin (listar/detalle/aprobar/rechazar).
 */
@Injectable({
  providedIn: 'root',
})
export class SolicitudesHabilitacion {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/solicitudes-empresas`;

  /** Público, sin auth: alta del formulario de solicitud de habilitación. */
  async crear(
    dto: CrearSolicitudEmpresaDto,
  ): Promise<SolicitudEmpresaResponseDto> {
    return firstValueFrom(
      this.http.post<SolicitudEmpresaResponseDto>(this.baseUrl, dto),
    );
  }

  /** Público, sin auth: validador async de unicidad (razón social / CUIT). */
  async verificarDisponibilidad(
    campo: 'cuit' | 'razon_social',
    valor: string,
  ): Promise<{ disponible: boolean }> {
    const params = new HttpParams().set('campo', campo).set('valor', valor);
    return firstValueFrom(
      this.http.get<{ disponible: boolean }>(`${this.baseUrl}/disponibilidad`, {
        params,
      }),
    );
  }

  /** Requiere sesión de administrador. */
  async listar(
    query: ListarSolicitudesQueryDto = {},
  ): Promise<SolicitudesPaginadasResponseDto> {
    let params = new HttpParams();
    if (query.estado !== undefined) {
      params = params.set('estado', query.estado);
    }
    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.limit !== undefined) {
      params = params.set('limit', query.limit);
    }

    return firstValueFrom(
      this.http.get<SolicitudesPaginadasResponseDto>(this.baseUrl, {
        params,
      }),
    );
  }

  /** Requiere sesión de administrador. */
  async obtenerPorId(id: number): Promise<SolicitudEmpresaResponseDto> {
    return firstValueFrom(
      this.http.get<SolicitudEmpresaResponseDto>(`${this.baseUrl}/${id}`),
    );
  }

  /** Requiere sesión de administrador. */
  async aprobar(id: number): Promise<SolicitudEmpresaResponseDto> {
    return firstValueFrom(
      this.http.patch<SolicitudEmpresaResponseDto>(
        `${this.baseUrl}/${id}/aprobar`,
        {},
      ),
    );
  }

  /** Requiere sesión de administrador. */
  async rechazar(
    id: number,
    dto: RechazarSolicitudDto,
  ): Promise<SolicitudEmpresaResponseDto> {
    return firstValueFrom(
      this.http.patch<SolicitudEmpresaResponseDto>(
        `${this.baseUrl}/${id}/rechazar`,
        dto,
      ),
    );
  }
}
