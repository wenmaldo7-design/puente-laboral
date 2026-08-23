import { Component, OnInit, computed, inject, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizacionHomeService } from '../../services/organizacion-home.service';
import {
  CrearOportunidadDto,
  FILTROS_OPORTUNIDAD_ORG,
  FiltroOportunidadOrg,
  MetricaOrgResumen,
  OportunidadPublicada,
  PostulanteReciente,
  TipoOportunidadOrg,
} from '../../models/organizacion-home.model';

@Component({
  selector: 'app-home-organizacion-page',
  imports: [RouterLink],
  templateUrl: './home-organizacion-page.html',
  styleUrl: './home-organizacion-page.css',
})
export class HomeOrganizacionPage implements OnInit {
  protected readonly nombreOrganizacion = signal('InnovarTech');
  protected readonly metricas = signal<MetricaOrgResumen[]>([]);
  protected readonly oportunidades = signal<OportunidadPublicada[]>([]);
  protected readonly postulantesRecientes = signal<PostulanteReciente[]>([]);

  protected readonly filtros: FiltroOportunidadOrg[] = FILTROS_OPORTUNIDAD_ORG;
  protected readonly filtroActivo = signal<FiltroOportunidadOrg['id']>('todas');
  protected readonly terminoBusqueda = signal('');

  // Control del modal de publicación
  protected readonly modalPublicarAbierto = signal(false);
  protected readonly guardandoOportunidad = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);
  protected readonly exitoMensaje = signal<string | null>(null);

  // Campos reactivos del formulario de publicación
  protected readonly draftTitulo = signal('');
  protected readonly draftTipo = signal<TipoOportunidadOrg>('empleo');
  protected readonly draftUbicacion = signal('');
  protected readonly draftDescripcion = signal('');

  protected readonly oportunidadesFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();

    return this.oportunidades().filter((op) => {
      let coincideFiltro = true;
      if (filtro === 'activa' || filtro === 'pausada' || filtro === 'cerrada') {
        coincideFiltro = op.estado === filtro;
      } else if (filtro === 'empleo' || filtro === 'curso' || filtro === 'mentoria') {
        coincideFiltro = op.tipo === filtro;
      }

      const coincideBusqueda =
        !termino ||
        op.titulo.toLowerCase().includes(termino) ||
        op.ubicacion.toLowerCase().includes(termino);

      return coincideFiltro && coincideBusqueda;
    });
  });

  private readonly homeService = inject(OrganizacionHomeService);

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.homeService.getMetricas().subscribe((m) => this.metricas.set(m));
    this.homeService.getOportunidadesPublicadas().subscribe((op) => this.oportunidades.set(op));
    this.homeService.getPostulantesRecientes().subscribe((p) => this.postulantesRecientes.set(p));
  }

  protected seleccionarFiltro(id: FiltroOportunidadOrg['id']): void {
    this.filtroActivo.set(id);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  protected abrirModalPublicar(): void {
    this.draftTitulo.set('');
    this.draftTipo.set('empleo');
    this.draftUbicacion.set('');
    this.draftDescripcion.set('');
    this.errorFormulario.set(null);
    this.modalPublicarAbierto.set(true);
  }

  protected abrirModalPublicarCurso(): void {
    this.abrirModalPublicar();
    this.draftTipo.set('curso');
  }

  @HostListener('document:keydown.escape')
  protected cerrarModalPublicar(): void {
    if (this.guardandoOportunidad()) return;
    this.modalPublicarAbierto.set(false);
    this.errorFormulario.set(null);
  }

  protected onTituloInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.draftTitulo.set(input.value);
    if (this.errorFormulario()) this.errorFormulario.set(null);
  }

  protected onTipoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.draftTipo.set(select.value as TipoOportunidadOrg);
  }

  protected onUbicacionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.draftUbicacion.set(input.value);
    if (this.errorFormulario()) this.errorFormulario.set(null);
  }

  protected onDescripcionInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.draftDescripcion.set(textarea.value);
  }

  protected guardarOportunidad(): void {
    const titulo = this.draftTitulo().trim();
    const ubicacion = this.draftUbicacion().trim();
    const tipo = this.draftTipo();
    const descripcion = this.draftDescripcion().trim();

    if (!titulo) {
      this.errorFormulario.set('Por favor, ingresá el título de la oportunidad.');
      return;
    }

    if (!ubicacion) {
      this.errorFormulario.set('Por favor, indicá la ubicación o modalidad (ej. Remoto, Córdoba).');
      return;
    }

    const payload: CrearOportunidadDto = {
      titulo,
      tipo,
      ubicacion,
      descripcion: descripcion || undefined,
    };

    this.guardandoOportunidad.set(true);
    this.errorFormulario.set(null);

    this.homeService.crearOportunidad(payload).subscribe({
      next: (nueva) => {
        this.oportunidades.update((prev) => [nueva, ...prev]);
        // Actualizar métricas
        this.homeService.getMetricas().subscribe((m) => this.metricas.set(m));
        this.guardandoOportunidad.set(false);
        this.modalPublicarAbierto.set(false);
        this.exitoMensaje.set(`¡Oportunidad "${nueva.titulo}" publicada con éxito!`);
        setTimeout(() => this.exitoMensaje.set(null), 4000);
      },
      error: () => {
        this.guardandoOportunidad.set(false);
        this.errorFormulario.set('Ocurrió un error al guardar la oportunidad. Intente nuevamente.');
      },
    });
  }
}
