import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { Mentorias } from '../../services/mentorias';
import { InscripcionesMentorias } from '../../services/inscripciones-mentorias';
import { Mentoria } from '../../models/mentoria.model';
import { PerfilBeneficiarioService } from '../../../beneficiarios/services/perfil-beneficiario.service';
import { PerfilBeneficiario } from '../../../beneficiarios/models/perfil-beneficiario.model';

@Component({
  selector: 'app-detalle-mentoria-page',
  imports: [RouterLink, Header, Footer],
  templateUrl: './detalle-mentoria-page.html',
  styleUrl: './detalle-mentoria-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleMentoriaPage implements OnInit {
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  protected readonly perfil = toSignal<PerfilBeneficiario | null>(
    this.perfilBeneficiarioService.getPerfil(),
    { initialValue: null },
  );
  protected readonly nombreBeneficiario = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');
  protected readonly notificacionesNoLeidas = signal(2);

  protected readonly mentoria = signal<Mentoria | null>(null);
  protected readonly cargando = signal(true);
  protected readonly inscribiendo = signal(false);
  protected readonly dandoBaja = signal(false);

  protected readonly estaInscripto = computed(() => this.mentoria()?.inscrito ?? false);

  private readonly route = inject(ActivatedRoute);
  private readonly mentoriasService = inject(Mentorias);
  private readonly inscripcionesService = inject(InscripcionesMentorias);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id)) {
      this.cargando.set(false);
      return;
    }

    this.mentoriasService.getMentoriaPorId(id).subscribe({
      next: (mentoria) => {
        this.mentoria.set(mentoria);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  protected inscribirme(): void {
    const mentoria = this.mentoria();
    if (!mentoria || this.inscribiendo() || this.estaInscripto()) return;

    this.inscribiendo.set(true);
    this.inscripcionesService.inscribirse(mentoria.id).subscribe(() => {
      this.mentoria.set({ ...mentoria, inscrito: true });
      this.inscribiendo.set(false);
    });
  }

  protected darDeBaja(): void {
    const mentoria = this.mentoria();
    if (!mentoria || this.dandoBaja() || !this.estaInscripto()) return;

    this.dandoBaja.set(true);
    this.inscripcionesService.darDeBaja(mentoria.id).subscribe(() => {
      this.mentoria.set({ ...mentoria, inscrito: false });
      this.dandoBaja.set(false);
    });
  }
}
