import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { Postulaciones } from '../../services/postulaciones';
import { Postulacion } from '../../models/postulacion.model';
import { PerfilBeneficiarioService } from '../../../beneficiarios/services/perfil-beneficiario.service';
import { PerfilBeneficiario } from '../../../beneficiarios/models/perfil-beneficiario.model';

@Component({
  selector: 'app-mis-postulaciones-page',
  imports: [RouterLink, Header, Footer],
  templateUrl: './mis-postulaciones-page.html',
  styleUrl: './mis-postulaciones-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisPostulacionesPage implements OnInit {
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  protected readonly perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  protected readonly nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');
  protected readonly notificacionesNoLeidas = signal(2);

  protected readonly postulaciones = signal<Postulacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly postulacionesService = inject(Postulaciones);

  ngOnInit(): void {
    this.postulacionesService.misPostulaciones().subscribe({
      next: (postulaciones) => {
        this.postulaciones.set(postulaciones);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos cargar tus postulaciones.')
            : 'No pudimos cargar tus postulaciones.',
        );
      },
    });
  }
}
