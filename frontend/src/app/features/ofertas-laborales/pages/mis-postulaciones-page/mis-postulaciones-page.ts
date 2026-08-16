import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { Postulaciones } from '../../services/postulaciones';
import { Postulacion } from '../../models/postulacion.model';

@Component({
  selector: 'app-mis-postulaciones-page',
  imports: [RouterLink, Header, Footer],
  templateUrl: './mis-postulaciones-page.html',
  styleUrl: './mis-postulaciones-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisPostulacionesPage implements OnInit {
  protected readonly nombreBeneficiario = signal('Camila');
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
