import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { OfertasLaborales } from '../../services/ofertas-laborales';
import { MENSAJE_NO_DISPONIBLE, OfertaLaboralBeneficiario } from '../../models/postulacion.model';
import { PerfilBeneficiarioService } from '../../../beneficiarios/services/perfil-beneficiario.service';
import { PerfilBeneficiario } from '../../../beneficiarios/models/perfil-beneficiario.model';
import { Notificaciones } from '../../../notificaciones/services/notificaciones';

type ModalidadFiltro = 'todas' | 'virtual' | 'presencial';

interface FiltroModalidad {
  id: ModalidadFiltro;
  etiqueta: string;
}

const FILTROS_MODALIDAD: FiltroModalidad[] = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'presencial', etiqueta: 'Presencial' },
  { id: 'virtual', etiqueta: 'Virtual' },
];

@Component({
  selector: 'app-listado-ofertas-page',
  imports: [RouterLink, Header, Footer],
  templateUrl: './listado-ofertas-page.html',
  styleUrl: './listado-ofertas-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoOfertasPage implements OnInit {
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  protected readonly perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  protected readonly nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');
  private readonly notificacionesService = inject(Notificaciones);
  protected readonly notificacionesNoLeidas = this.notificacionesService.contadorNoLeidas;

  protected readonly ofertas = signal<OfertaLaboralBeneficiario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtros = FILTROS_MODALIDAD;
  protected readonly filtroActivo = signal<ModalidadFiltro>('todas');
  protected readonly terminoBusqueda = signal('');

  protected readonly ofertasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();

    return this.ofertas().filter((oferta) => {
      const coincideFiltro = filtro === 'todas' || oferta.modalidad === filtro;
      const coincideBusqueda =
        !termino ||
        oferta.titulo.toLowerCase().includes(termino) ||
        oferta.empresa.toLowerCase().includes(termino);

      return coincideFiltro && coincideBusqueda;
    });
  });

  private readonly ofertasLaboralesService = inject(OfertasLaborales);

  ngOnInit(): void {
    this.notificacionesService.refrescarContador();
    this.ofertasLaboralesService.getCompatibles().subscribe({
      next: (ofertas) => {
        this.ofertas.set(ofertas);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos cargar las ofertas laborales. Probá de nuevo.')
            : 'No pudimos cargar las ofertas laborales. Probá de nuevo.',
        );
      },
    });
  }

  protected seleccionarFiltro(id: ModalidadFiltro): void {
    this.filtroActivo.set(id);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  protected etiquetaEstado(oferta: OfertaLaboralBeneficiario): string | null {
    return oferta.motivo_no_disponible ? MENSAJE_NO_DISPONIBLE[oferta.motivo_no_disponible] : null;
  }
}
