import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../auth/services/auth';
import {
  EstadoSolicitud,
  SolicitudEmpresaResponseDto,
} from '../../models/solicitud-habilitacion.model';
import { SolicitudesHabilitacion } from '../../services/solicitudes-habilitacion';
import { Header } from '../../../../shared/ui/header/header';

const LIMITE_POR_PAGINA = 20;

/** Panel admin: listado de solicitudes de habilitación en estado PENDIENTE. */
@Component({
  selector: 'app-solicitudes-pendientes-page',
  imports: [RouterLink, DatePipe, Header],
  templateUrl: './solicitudes-pendientes-page.html',
  styleUrl: './solicitudes-pendientes-page.css',
})
export class SolicitudesPendientesPage implements OnInit {
  private readonly solicitudesService = inject(SolicitudesHabilitacion);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly items = signal<SolicitudEmpresaResponseDto[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / LIMITE_POR_PAGINA)),
  );

  ngOnInit(): void {
    void this.cargar();
  }

  async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  async cambiarPagina(pagina: number): Promise<void> {
    if (pagina < 1 || pagina > this.totalPaginas()) {
      return;
    }
    this.pagina.set(pagina);
    await this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const respuesta = await this.solicitudesService.listar({
        estado: EstadoSolicitud.PENDIENTE,
        page: this.pagina(),
        limit: LIMITE_POR_PAGINA,
      });
      this.items.set(respuesta.data);
      this.total.set(respuesta.total);
    } catch {
      this.error.set('No pudimos cargar las solicitudes pendientes.');
    } finally {
      this.cargando.set(false);
    }
  }
}
