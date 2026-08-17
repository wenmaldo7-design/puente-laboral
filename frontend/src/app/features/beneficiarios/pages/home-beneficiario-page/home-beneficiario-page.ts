import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { BeneficiarioHomeService } from '../../services/beneficiario-home.service';
import { PerfilBeneficiarioService } from '../../services/perfil-beneficiario.service';
import { OfertasLaborales } from '../../../ofertas-laborales/services/ofertas-laborales';
import { Postulaciones } from '../../../ofertas-laborales/services/postulaciones';
import { OfertaLaboralBeneficiario, Postulacion } from '../../../ofertas-laborales/models/postulacion.model';
import {
  ActualizacionPostulacion,
  FILTROS_OPORTUNIDAD,
  FiltroOportunidad,
  MetricaResumen,
  Oportunidad,
} from '../../models/beneficiario-home.model';
import { PerfilBeneficiario } from '../../models/perfil-beneficiario.model';

/** Todavía no hay endpoint de notificaciones: se muestra un valor fijo, igual que en el resto de las páginas de beneficiario. */
const NOTIFICACIONES_MOCK = 2;

@Component({
  selector: 'app-home-beneficiario-page',
  imports: [Header, Footer],
  templateUrl: './home-beneficiario-page.html',
  styleUrl: './home-beneficiario-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBeneficiarioPage {
  private readonly beneficiarioHomeService = inject(BeneficiarioHomeService);
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  private readonly ofertasLaboralesService = inject(OfertasLaborales);
  private readonly postulacionesService = inject(Postulaciones);

  protected readonly perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  protected readonly nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');

  protected readonly postulaciones = toSignal(this.postulacionesService.misPostulaciones(), {
    initialValue: [] as Postulacion[],
  });

  private readonly ofertasCompatibles = toSignal(this.ofertasLaboralesService.getCompatibles(), {
    initialValue: [] as OfertaLaboralBeneficiario[],
  });

  /** Postulaciones y En curso salen de datos reales; Notificaciones sigue mockeado (sin endpoint todavía). */
  protected readonly metricas = computed<MetricaResumen[]>(() => [
    { etiqueta: 'Postulaciones', valor: this.postulaciones().length },
    {
      etiqueta: 'En curso',
      valor: this.postulaciones().filter((p) => p.estado_postulacion === 'pendiente').length,
    },
    { etiqueta: 'Notificaciones', valor: NOTIFICACIONES_MOCK },
  ]);

  /** Reusa las ofertas laborales compatibles con el beneficiario (mismo endpoint que el listado de ofertas). */
  protected readonly oportunidades = computed<Oportunidad[]>(() =>
    [...this.ofertasCompatibles()]
      .sort((a, b) => b.match_porcentaje - a.match_porcentaje)
      .map((oferta) => ({
        id: String(oferta.id_servicio),
        titulo: oferta.titulo,
        organizacion: oferta.empresa,
        matchPorcentaje: oferta.match_porcentaje,
        tipo: 'empleo',
      })),
  );

  protected readonly actualizaciones = toSignal(this.beneficiarioHomeService.getUltimasActualizaciones(), {
    initialValue: [] as ActualizacionPostulacion[],
  });

  protected readonly notificacionesNoLeidas = computed(
    () => this.metricas().find((metrica) => metrica.etiqueta === 'Notificaciones')?.valor ?? 0,
  );

  protected readonly filtros: FiltroOportunidad[] = FILTROS_OPORTUNIDAD;
  protected readonly filtroActivo = signal<FiltroOportunidad['id']>('todo');
  protected readonly terminoBusqueda = signal('');

  protected readonly oportunidadesFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();

    return this.oportunidades().filter((oportunidad) => {
      const coincideFiltro = filtro === 'todo' || oportunidad.tipo === filtro;
      const coincideBusqueda =
        !termino ||
        oportunidad.titulo.toLowerCase().includes(termino) ||
        oportunidad.organizacion.toLowerCase().includes(termino);

      return coincideFiltro && coincideBusqueda;
    });
  });

  protected seleccionarFiltro(id: FiltroOportunidad['id']): void {
    this.filtroActivo.set(id);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}
