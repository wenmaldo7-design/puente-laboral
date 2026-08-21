import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { Auth } from '../../../auth/services/auth';
import { Notificaciones } from '../../services/notificaciones';
import { Notificacion } from '../../models/notificacion.model';

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

@Component({
  selector: 'app-bandeja-notificaciones-page',
  imports: [Header, Footer],
  templateUrl: './bandeja-notificaciones-page.html',
  styleUrl: './bandeja-notificaciones-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BandejaNotificacionesPage implements OnInit {
  private readonly notificacionesService = inject(Notificaciones);
  private readonly auth = inject(Auth);

  /**
   * La sesión solo trae el email (no el nombre real) y esta página sirve
   * tanto a beneficiarios como a empresas, así que no hay un servicio de
   * perfil único del que sacar el nombre. Se usa el segmento antes del
   * '@' como aproximación, para no romper la consistencia visual del saludo
   * del header con el resto de las páginas.
   */
  protected readonly nombre = computed(() => this.auth.sesion()?.email.split('@')[0] ?? '');
  protected readonly notificacionesNoLeidas = this.notificacionesService.contadorNoLeidas;

  protected readonly notificaciones = signal<Notificacion[]>([]);
  protected readonly hayNoLeidas = computed(() => this.notificaciones().some((n) => !n.leida));

  protected readonly formatearFecha = formatearFecha;

  ngOnInit(): void {
    this.notificacionesService.listar().subscribe((notificaciones) => this.notificaciones.set(notificaciones));
    this.notificacionesService.refrescarContador();
  }

  protected onClickNotificacion(notificacion: Notificacion): void {
    if (notificacion.leida) return;

    this.notificacionesService.marcarLeida(notificacion.id).subscribe((actualizada) => {
      this.notificaciones.update((lista) => lista.map((n) => (n.id === actualizada.id ? actualizada : n)));
    });
  }

  protected marcarTodasLeidas(): void {
    this.notificacionesService.marcarTodasLeidas().subscribe(() => {
      this.notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
    });
  }
}
