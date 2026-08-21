import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../../../shared/ui/header/header';
import { Auth } from '../../../auth/services/auth';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { EmpresaHomeService } from '../../services/empresa-home.service';
import { PerfilEmpresaService } from '../../services/perfil-empresa.service';
import {
  FILTROS_OPORTUNIDAD_EMPRESA,
  FiltroOportunidadEmpresa,
  MetricaEmpresaResumen,
  OportunidadPublicada,
  PostulanteReciente,
} from '../../models/empresa-home.model';

@Component({
  selector: 'app-home-empresa-page',
  imports: [RouterLink, Header],
  templateUrl: './home-empresa-page.html',
  styleUrl: './home-empresa-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeEmpresaPage implements OnInit {
  protected readonly nombreEmpresa = signal('');
  protected readonly avatarIniciales = signal('');
  protected readonly metricas = signal<MetricaEmpresaResumen[]>([]);
  protected readonly oportunidades = signal<OportunidadPublicada[]>([]);
  protected readonly postulantesRecientes = signal<PostulanteReciente[]>([]);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtros: FiltroOportunidadEmpresa[] = FILTROS_OPORTUNIDAD_EMPRESA;
  protected readonly filtroActivo = signal<FiltroOportunidadEmpresa['id']>('todas');
  protected readonly terminoBusqueda = signal('');

  protected readonly oportunidadesFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();

    return this.oportunidades().filter((op) => {
      const coincideFiltro = filtro === 'todas' || op.estado === filtro;
      const coincideBusqueda = !termino || op.titulo.toLowerCase().includes(termino);

      return coincideFiltro && coincideBusqueda;
    });
  });

  private readonly homeService = inject(EmpresaHomeService);
  private readonly perfilService = inject(PerfilEmpresaService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.perfilService.getPerfil().subscribe({
      next: (perfil) => {
        this.nombreEmpresa.set(perfil.razonSocial);
        this.avatarIniciales.set(perfil.avatarIniciales);
      },
      error: () => {
        // El perfil no es crítico para el resto del panel: si falla, seguimos mostrando el resto.
      },
    });

    this.homeService.getMetricas().subscribe({
      next: (m) => this.metricas.set(m),
      error: () => this.metricas.set([]),
    });

    this.homeService.getOportunidadesPublicadas().subscribe({
      next: (op) => {
        this.oportunidades.set(op);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No pudimos cargar tus oportunidades publicadas.')
            : 'No pudimos cargar tus oportunidades publicadas.',
        );
      },
    });

    this.homeService.getPostulantesRecientes().subscribe({
      next: (p) => this.postulantesRecientes.set(p),
      error: () => this.postulantesRecientes.set([]),
    });
  }

  protected seleccionarFiltro(id: FiltroOportunidadEmpresa['id']): void {
    this.filtroActivo.set(id);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  /** Solo existe 'oferta_laboral' hoy (cursos/mentorias no tienen creación real todavía). */
  protected etiquetaTipo(tipoServicio: string): string {
    return tipoServicio === 'oferta_laboral' ? 'Empleo' : tipoServicio;
  }

  protected onCambioEstado(idPostulacion: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    const estadoAnterior = this.postulantesRecientes().find((p) => p.id === idPostulacion)?.estado;

    select.disabled = true;

    this.homeService.actualizarEstadoPostulacion(idPostulacion, nuevoEstado).subscribe({
      next: () => {
        select.disabled = false;
        this.postulantesRecientes.update((postulantes) =>
          postulantes.map((p) => (p.id === idPostulacion ? { ...p, estado: nuevoEstado } : p)),
        );
      },
      error: (err: unknown) => {
        select.disabled = false;
        const msjError =
          err instanceof HttpErrorResponse
            ? extraerMensajeDeError(err.error, 'No se pudo actualizar el estado de la postulación.')
            : 'No se pudo actualizar el estado de la postulación.';
        
        alert(msjError);

        // Revertir el select al estado anterior
        if (estadoAnterior) {
          select.value = estadoAnterior;
        }
      },
    });
  }
}
