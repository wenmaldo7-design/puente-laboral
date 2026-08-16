import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
})
export class HomeBeneficiarioPage implements OnInit {
  protected readonly nombreBeneficiario = signal('Camila');
  protected readonly metricas = signal<MetricaResumen[]>([]);
  protected readonly oportunidades = signal<Oportunidad[]>([]);
  protected readonly actualizaciones = signal<ActualizacionPostulacion[]>([]);

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

  private readonly beneficiarioHomeService = inject(BeneficiarioHomeService);

  ngOnInit(): void {
    this.beneficiarioHomeService.getMetricas().subscribe((metricas) => this.metricas.set(metricas));
    this.beneficiarioHomeService
      .getOportunidadesRecomendadas()
      .subscribe((oportunidades) => this.oportunidades.set(oportunidades));
    this.beneficiarioHomeService
      .getUltimasActualizaciones()
      .subscribe((actualizaciones) => this.actualizaciones.set(actualizaciones));
  }

  protected seleccionarFiltro(id: FiltroOportunidad['id']): void {
    this.filtroActivo.set(id);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}
