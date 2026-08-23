import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { Mentorias } from '../../services/mentorias';
import { FILTROS_MODALIDAD, FiltroModalidad, Mentoria } from '../../models/mentoria.model';
import { PerfilBeneficiarioService } from '../../../beneficiarios/services/perfil-beneficiario.service';
import { PerfilBeneficiario } from '../../../beneficiarios/models/perfil-beneficiario.model';
import { Notificaciones } from '../../../notificaciones/services/notificaciones';
import { OfertasLaborales } from '../../../ofertas-laborales/services/ofertas-laborales';

@Component({
  selector: 'app-listado-mentorias-page',
  imports: [RouterLink, Header, Footer, DatePipe],
  templateUrl: './listado-mentorias-page.html',
  styleUrl: './listado-mentorias-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoMentoriasPage implements OnInit {
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  protected readonly perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  protected readonly nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');
  private readonly notificacionesService = inject(Notificaciones);
  protected readonly notificacionesNoLeidas = this.notificacionesService.contadorNoLeidas;
  protected readonly mentorias = signal<Mentoria[]>([]);

  protected readonly filtros: FiltroModalidad[] = FILTROS_MODALIDAD;
  protected readonly filtroActivo = signal<FiltroModalidad['id']>('todas');
  protected readonly terminoBusqueda = signal('');
  protected readonly filtroProvincia = signal<string>('');
  protected readonly provinciasCatalogo = signal<string[]>([]);

  protected readonly mentoriasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();
    const prov = this.filtroProvincia();

    return this.mentorias().filter((mentoria) => {
      const coincideFiltro = filtro === 'todas' || mentoria.modalidad === filtro;
      const coincideProvincia = !prov || mentoria.provincia === prov;
      const coincideBusqueda =
        !termino ||
        mentoria.titulo.toLowerCase().includes(termino) ||
        mentoria.descripcion.toLowerCase().includes(termino);

      return coincideFiltro && coincideBusqueda && coincideProvincia;
    });
  });

  private readonly mentoriasService = inject(Mentorias);
  private readonly ofertasLaboralesService = inject(OfertasLaborales);

  ngOnInit(): void {
    this.mentoriasService.getMentorias().subscribe((mentorias) => this.mentorias.set(mentorias));
    this.notificacionesService.refrescarContador();
    this.ofertasLaboralesService.getCatalogoProvincias().subscribe((provincias) => this.provinciasCatalogo.set(provincias));
  }

  protected seleccionarFiltro(id: FiltroModalidad['id']): void {
    this.filtroActivo.set(id);
  }

  protected onProvinciaSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroProvincia.set(select.value);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}
