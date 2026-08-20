import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';

/** Espeja NotificacionResponseDto del backend. */
interface NotificacionResponseDto {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  fecha_envio: string;
  leida: boolean;
}

interface ContadorNoLeidasResponseDto {
  cantidad: number;
}

function aNotificacion(dto: NotificacionResponseDto): Notificacion {
  return {
    id: dto.id,
    tipo: dto.tipo,
    mensaje: dto.mensaje,
    fechaEnvio: dto.fecha_envio,
    leida: dto.leida,
  };
}

@Injectable({
  providedIn: 'root',
})
export class Notificaciones {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/notificaciones`;

  private readonly _contadorNoLeidas = signal(0);
  /** Contador compartido de no leídas: una sola fuente de verdad para todas las páginas. */
  readonly contadorNoLeidas = this._contadorNoLeidas.asReadonly();

  listar(): Observable<Notificacion[]> {
    return this.http
      .get<NotificacionResponseDto[]>(this.baseUrl)
      .pipe(map((dtos) => dtos.map(aNotificacion)));
  }

  contarNoLeidas(): Observable<number> {
    return this.http
      .get<ContadorNoLeidasResponseDto>(`${this.baseUrl}/no-leidas`)
      .pipe(map((dto) => dto.cantidad));
  }

  /** Pide el contador al backend y actualiza `contadorNoLeidas`. */
  refrescarContador(): void {
    this.contarNoLeidas().subscribe((cantidad) => this._contadorNoLeidas.set(cantidad));
  }

  marcarLeida(id: number): Observable<Notificacion> {
    return this.http
      .patch<NotificacionResponseDto>(`${this.baseUrl}/${id}/leida`, {})
      .pipe(
        map(aNotificacion),
        tap(() => this.refrescarContador()),
      );
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http
      .patch<void>(`${this.baseUrl}/leidas`, {})
      .pipe(
        map(() => undefined),
        tap(() => this.refrescarContador()),
      );
  }
}
