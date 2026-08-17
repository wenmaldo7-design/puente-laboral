import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { BeneficiarioHomeService } from '../../services/beneficiario-home.service';
import {
  ActualizacionPostulacion,
  FILTROS_OPORTUNIDAD,
  FiltroOportunidad,
  MetricaResumen,
  Oportunidad,
} from '../../models/beneficiario-home.model';

@Component({
  selector: 'app-home-beneficiario-page',
  imports: [Header, Footer],
  templateUrl: './home-beneficiario-page.html',
  styleUrl: './home-beneficiario-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBeneficiarioPage {
  private readonly beneficiarioHomeService = inject(BeneficiarioHomeService);

  protected readonly nombreBeneficiario = signal('Camila');
  protected readonly metricas = toSignal(this.beneficiarioHomeService.getMetricas(), {
    initialValue: [] as MetricaResumen[],
  });
  protected readonly oportunidades = toSignal(this.beneficiarioHomeService.getOportunidadesRecomendadas(), {
    initialValue: [] as Oportunidad[],
  });
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
