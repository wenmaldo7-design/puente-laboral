import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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

type CampoSimple = 'fechaNacimiento' | 'direccion' | 'telefono';
type SeccionTags = 'habilidades' | 'areasInteres';
type ClaveEdicion = CampoSimple | 'enlaces' | SeccionTags;

/** Grupo de opciones del dropdown de tags. `categoria` es null para catálogos sin agrupar. */
interface GrupoOpcionesTag {
  categoria: string | null;
  opciones: string[];
}

@Component({
  selector: 'app-perfil-beneficiario-page',
  imports: [DatePipe, Header, Footer],
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

  protected readonly draftCampoSimple = signal('');
  protected readonly draftEnlaces = signal<EnlacesPerfil>({ linkedin: '', github: '', cvUrl: '' });

  protected readonly catalogoHabilidades = signal<HabilidadCatalogo[]>([]);
  protected readonly catalogoAreasInteres = signal<string[]>([]);
  protected readonly draftTags = signal<string[]>([]);
  protected readonly tagBusqueda = signal('');
  private readonly tagSeccionEnEdicion = signal<SeccionTags | null>(null);

  /**
   * Habilidades se agrupa por categoría (son ~95 opciones); Áreas de interés
   * es una lista chica y queda en un único grupo sin encabezado.
   */
  protected readonly opcionesTagsFiltradas = computed<GrupoOpcionesTag[]>(() => {
    const seccion = this.tagSeccionEnEdicion();
    if (!seccion) return [];

    const termino = this.tagBusqueda().trim().toLowerCase();
    const yaSeleccionados = new Set(this.draftTags());
    const coincide = (nombre: string) =>
      !yaSeleccionados.has(nombre) && (!termino || nombre.toLowerCase().startsWith(termino));

    if (seccion === 'areasInteres') {
      const opciones = this.catalogoAreasInteres().filter(coincide);
      return opciones.length ? [{ categoria: null, opciones }] : [];
    }

    const grupos: GrupoOpcionesTag[] = [];
    for (const habilidad of this.catalogoHabilidades()) {
      if (!coincide(habilidad.nombre)) continue;
      let grupo = grupos.find((g) => g.categoria === habilidad.categoria);
      if (!grupo) {
        grupo = { categoria: habilidad.categoria, opciones: [] };
        grupos.push(grupo);
      }
      grupo.opciones.push(habilidad.nombre);
    }
    return grupos;
  });

  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  private campoSimpleEnEdicion: CampoSimple | null = null;

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
    this.campoSimpleEnEdicion = null;
    this.tagSeccionEnEdicion.set(null);
  }

  protected iniciarEdicionCampo(campo: CampoSimple): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.campoSimpleEnEdicion = campo;
    this.draftCampoSimple.set(perfil[campo]);
    this.errorGuardado.set(null);
    this.edicionActiva.set(campo);
  }

  protected onDraftCampoSimpleInput(event: Event): void {
    this.draftCampoSimple.set((event.target as HTMLInputElement).value);
  }

  /** Enmascara el teléfono a medida que se escribe: solo dígitos, agrupados como "351-555-0102". */
  protected onDraftTelefonoInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const digitos = inputEl.value.replace(/\D/g, '').slice(0, 10);
    const grupos = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 10)].filter(Boolean);
    const formateado = grupos.join('-');
    // Se refleja de inmediato en el input nativo: si el valor enmascarado no
    // cambia respecto del anterior (p. ej. se tipeó un carácter inválido),
    // el binding de Angular no vuelve a pisar el DOM por sí solo.
    inputEl.value = formateado;
    this.draftCampoSimple.set(formateado);
  }

  protected guardarCampoSimple(): void {
    const campo = this.campoSimpleEnEdicion;
    if (!campo) return;

    const valor = this.draftCampoSimple();
    const payload =
      campo === 'fechaNacimiento'
        ? { fechaNacimiento: valor }
        : campo === 'direccion'
          ? { direccion: valor }
          : { telefono: valor };

    this.guardando.set(true);
    this.errorGuardado.set(null);
    this.perfilBeneficiarioService.actualizarDatos(payload).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.guardando.set(false);
        this.edicionActiva.set(null);
        this.campoSimpleEnEdicion = null;
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

  protected iniciarEdicionTags(seccion: SeccionTags): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.tagSeccionEnEdicion.set(seccion);
    this.draftTags.set([...perfil[seccion]]);
    this.tagBusqueda.set('');
    this.errorGuardado.set(null);
    this.edicionActiva.set(seccion);
  }

  protected onTagBusquedaInput(event: Event): void {
    this.tagBusqueda.set((event.target as HTMLInputElement).value);
  }

  protected agregarTag(opcion: string): void {
    this.draftTags.update((tags) => (tags.includes(opcion) ? tags : [...tags, opcion]));
    this.tagBusqueda.set('');
  }

  protected quitarTag(tag: string): void {
    this.draftTags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected guardarTags(): void {
    const seccion = this.tagSeccionEnEdicion();
    if (!seccion) return;

    this.guardando.set(true);
    this.errorGuardado.set(null);
    const guardar$ =
      seccion === 'habilidades'
        ? this.perfilBeneficiarioService.actualizarHabilidades(this.draftTags())
        : this.perfilBeneficiarioService.actualizarAreasInteres(this.draftTags());

    guardar$.subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.guardando.set(false);
        this.edicionActiva.set(null);
        this.tagSeccionEnEdicion.set(null);
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
