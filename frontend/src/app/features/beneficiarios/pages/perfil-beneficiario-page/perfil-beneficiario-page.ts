import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { PerfilBeneficiarioService } from '../../services/perfil-beneficiario.service';
import {
  EnlacesPerfil,
  HabilidadCatalogo,
  PerfilBeneficiario,
} from '../../models/perfil-beneficiario.model';
import {
  CampoSimple,
  GuardarCampoEvento,
  PerfilInfoPersonal,
} from '../../components/perfil-info-personal/perfil-info-personal';
import {
  GuardarTagsEvento,
  PerfilHabilidadesSection,
  SeccionTags,
} from '../../components/perfil-habilidades-section/perfil-habilidades-section';

type ClaveEdicion = CampoSimple | 'enlaces' | SeccionTags;

@Component({
  selector: 'app-perfil-beneficiario-page',
  imports: [Header, Footer, PerfilInfoPersonal, PerfilHabilidadesSection],
  templateUrl: './perfil-beneficiario-page.html',
  styleUrl: './perfil-beneficiario-page.css',
})
export class PerfilBeneficiarioPage implements OnInit {
  protected readonly perfil = signal<PerfilBeneficiario | null>(null);
  protected readonly notificacionesNoLeidas = signal(2);

  protected readonly nombreSaludo = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');

  protected readonly edicionActiva = signal<ClaveEdicion | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorGuardado = signal<string | null>(null);

  /** Subconjuntos tipados de `edicionActiva`, para pasarle a cada hijo solo lo que le corresponde. */
  protected readonly campoSimpleActivo = computed<CampoSimple | null>(() => {
    const clave = this.edicionActiva();
    return clave === 'fechaNacimiento' || clave === 'direccion' || clave === 'telefono' ? clave : null;
  });

  protected readonly seccionTagsActiva = computed<SeccionTags | null>(() => {
    const clave = this.edicionActiva();
    return clave === 'habilidades' || clave === 'areasInteres' ? clave : null;
  });

  protected readonly draftEnlaces = signal<EnlacesPerfil>({ linkedin: '', github: '', cvUrl: '' });

  protected readonly catalogoHabilidades = signal<HabilidadCatalogo[]>([]);
  protected readonly catalogoAreasInteres = signal<string[]>([]);

  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);

  ngOnInit(): void {
    this.perfilBeneficiarioService.getPerfil().subscribe((perfil) => this.perfil.set(perfil));
    this.perfilBeneficiarioService.getCatalogoHabilidades().subscribe((c) => this.catalogoHabilidades.set(c));
    this.perfilBeneficiarioService.getCatalogoAreasInteres().subscribe((c) => this.catalogoAreasInteres.set(c));
  }

  protected estaEditando(clave: ClaveEdicion): boolean {
    return this.edicionActiva() === clave;
  }

  protected cancelarEdicion(): void {
    this.edicionActiva.set(null);
    this.errorGuardado.set(null);
  }

  protected onPedirEdicionCampo(campo: CampoSimple): void {
    this.errorGuardado.set(null);
    this.edicionActiva.set(campo);
  }

  protected onGuardarCampo(evento: GuardarCampoEvento): void {
    const payload =
      evento.campo === 'fechaNacimiento'
        ? { fechaNacimiento: evento.valor }
        : evento.campo === 'direccion'
          ? { direccion: evento.valor }
          : { telefono: evento.valor };

    this.guardando.set(true);
    this.errorGuardado.set(null);
    this.perfilBeneficiarioService.actualizarDatos(payload).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.guardando.set(false);
        this.edicionActiva.set(null);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.errorGuardado.set(this.mensajeDeError(err));
      },
    });
  }

  protected iniciarEdicionEnlaces(): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.draftEnlaces.set({ ...perfil.enlaces });
    this.errorGuardado.set(null);
    this.edicionActiva.set('enlaces');
  }

  protected onDraftEnlacesInput(campo: keyof EnlacesPerfil, event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.draftEnlaces.update((enlaces) => ({ ...enlaces, [campo]: valor }));
  }

  protected guardarEnlaces(): void {
    const { linkedin, github, cvUrl } = this.draftEnlaces();

    this.guardando.set(true);
    this.errorGuardado.set(null);
    this.perfilBeneficiarioService.actualizarDatos({ linkedin, github, cvUrl }).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.guardando.set(false);
        this.edicionActiva.set(null);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.errorGuardado.set(this.mensajeDeError(err));
      },
    });
  }

  protected onPedirEdicionTags(seccion: SeccionTags): void {
    this.errorGuardado.set(null);
    this.edicionActiva.set(seccion);
  }

  protected onGuardarTags(evento: GuardarTagsEvento): void {
    this.guardando.set(true);
    this.errorGuardado.set(null);
    const guardar$ =
      evento.seccion === 'habilidades'
        ? this.perfilBeneficiarioService.actualizarHabilidades(evento.tags)
        : this.perfilBeneficiarioService.actualizarAreasInteres(evento.tags);

    guardar$.subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.guardando.set(false);
        this.edicionActiva.set(null);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.errorGuardado.set(this.mensajeDeError(err));
      },
    });
  }

  private mensajeDeError(err: unknown): string {
    const fallback = 'No pudimos guardar los cambios. Probá de nuevo.';
    if (err instanceof HttpErrorResponse) {
      return extraerMensajeDeError(err.error, fallback);
    }
    return fallback;
  }
}
