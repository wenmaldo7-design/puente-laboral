import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { OfertasLaborales } from '../../services/ofertas-laborales';
import { Postulaciones } from '../../services/postulaciones';
import { MENSAJE_NO_DISPONIBLE, OfertaLaboralBeneficiario } from '../../models/postulacion.model';
import { PerfilBeneficiarioService } from '../../../beneficiarios/services/perfil-beneficiario.service';
import { PerfilBeneficiario } from '../../../beneficiarios/models/perfil-beneficiario.model';

@Component({
  selector: 'app-detalle-oferta-page',
  imports: [RouterLink, Header, Footer, DecimalPipe],
  templateUrl: './detalle-oferta-page.html',
  styleUrl: './detalle-oferta-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleOfertaPage implements OnInit {
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  protected readonly perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  protected readonly nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');
  protected readonly notificacionesNoLeidas = signal(2);

  protected readonly oferta = signal<OfertaLaboralBeneficiario | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly postulando = signal(false);
  protected readonly errorPostulacion = signal<string | null>(null);
  protected readonly postulacionExitosa = signal(false);

  protected readonly mensajeNoDisponible = computed(() => {
    const motivo = this.oferta()?.motivo_no_disponible;
    return motivo ? MENSAJE_NO_DISPONIBLE[motivo] : null;
  });

  private readonly route = inject(ActivatedRoute);
  private readonly ofertasLaboralesService = inject(OfertasLaborales);
  private readonly postulacionesService = inject(Postulaciones);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.cargar(id);
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.error.set(null);
    this.ofertasLaboralesService.getDetalle(id).subscribe({
      next: (oferta) => {
        this.oferta.set(oferta);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos cargar esta oferta laboral.')
            : 'No pudimos cargar esta oferta laboral.',
        );
      },
    });
  }

  protected postularme(): void {
    const oferta = this.oferta();
    if (!oferta || this.postulando() || !oferta.puede_postularse) return;

    this.postulando.set(true);
    this.errorPostulacion.set(null);

    this.postulacionesService.postularme(oferta.id_servicio).subscribe({
      next: () => {
        this.postulando.set(false);
        this.postulacionExitosa.set(true);
        this.cargar(oferta.id_servicio);
      },
      error: (err: unknown) => {
        this.postulando.set(false);
        this.errorPostulacion.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos registrar tu postulación. Probá de nuevo.')
            : 'No pudimos registrar tu postulación. Probá de nuevo.',
        );
        // Otra postulación/cupo pudo haber cambiado el estado de la oferta entre que se cargó y se envió: refrescamos.
        this.cargar(oferta.id_servicio);
      },
    });
  }
}
