import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Notificaciones } from '../../notificaciones/services/notificaciones';
import { ActualizacionPostulacion } from '../models/beneficiario-home.model';

const MAX_ACTUALIZACIONES = 5;

/**
 * Métricas de postulaciones, "Recomendado para vos" y las notificaciones
 * ya salen de datos reales (Postulaciones/OfertasLaborales/Notificaciones,
 * ver home-beneficiario-page.ts). Las últimas actualizaciones reusan el
 * módulo de notificaciones en vez de un endpoint propio.
 */
@Injectable({ providedIn: 'root' })
export class BeneficiarioHomeService {
  private readonly notificacionesService = inject(Notificaciones);

  getUltimasActualizaciones(): Observable<ActualizacionPostulacion[]> {
    return this.notificacionesService.listar().pipe(
      map((notificaciones) =>
        notificaciones.slice(0, MAX_ACTUALIZACIONES).map((notificacion) => ({
          id: String(notificacion.id),
          mensaje: notificacion.mensaje,
          fecha: notificacion.fechaEnvio,
        })),
      ),
    );
  }
}
