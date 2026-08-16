import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { Mentorias } from '../../services/mentorias';
import { FILTROS_MODALIDAD, FiltroModalidad, Mentoria } from '../../models/mentoria.model';

@Component({
  selector: 'app-listado-mentorias-page',
  imports: [RouterLink, Header, Footer],
  templateUrl: './listado-mentorias-page.html',
  styleUrl: './listado-mentorias-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoMentoriasPage implements OnInit {
  protected readonly nombreBeneficiario = signal('Camila');
  protected readonly notificacionesNoLeidas = signal(2);
  protected readonly mentorias = signal<Mentoria[]>([]);

  protected readonly filtros: FiltroModalidad[] = FILTROS_MODALIDAD;
  protected readonly filtroActivo = signal<FiltroModalidad['id']>('todas');
  protected readonly terminoBusqueda = signal('');

  protected readonly mentoriasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();

    return this.mentorias().filter((mentoria) => {
      const coincideFiltro = filtro === 'todas' || mentoria.modalidad === filtro;
      const coincideBusqueda =
        !termino ||
        mentoria.titulo.toLowerCase().includes(termino) ||
        mentoria.descripcion.toLowerCase().includes(termino);

      return coincideFiltro && coincideBusqueda;
    });
  });

  private readonly mentoriasService = inject(Mentorias);

  ngOnInit(): void {
    this.mentoriasService.getMentorias().subscribe((mentorias) => this.mentorias.set(mentorias));
  }

  protected seleccionarFiltro(id: FiltroModalidad['id']): void {
    this.filtroActivo.set(id);
  }

  protected onBusquedaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}
