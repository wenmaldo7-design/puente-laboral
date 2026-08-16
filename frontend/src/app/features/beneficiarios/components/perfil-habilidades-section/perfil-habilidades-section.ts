import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { HabilidadCatalogo } from '../../models/perfil-beneficiario.model';

export type SeccionTags = 'habilidades' | 'areasInteres';

export interface GuardarTagsEvento {
  seccion: SeccionTags;
  tags: string[];
}

/** Grupo de opciones del dropdown de tags. `categoria` es null para catálogos sin agrupar. */
interface GrupoOpcionesTag {
  categoria: string | null;
  opciones: string[];
}

/**
 * Sección de Habilidades y Áreas de interés del perfil, con edición de tags
 * por catálogo cerrado (autocompletado, sin texto libre).
 *
 * El padre sigue siendo dueño de `edicionActiva` (coordina qué sección de
 * toda la página está en edición): este componente solo pinta según lo que
 * le llega en `activo` y pide/confirma/cancela por eventos. Expone
 * `hayCambiosSinGuardar` para que el padre pueda consultar el dirty-check
 * antes de dejar abrir otra edición en cualquier parte de la página.
 */
@Component({
  selector: 'app-perfil-habilidades-section',
  imports: [],
  templateUrl: './perfil-habilidades-section.html',
  styleUrl: './perfil-habilidades-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilHabilidadesSection {
  readonly habilidades = input.required<string[]>();
  readonly areasInteres = input.required<string[]>();
  readonly catalogoHabilidades = input<HabilidadCatalogo[]>([]);
  readonly catalogoAreasInteres = input<string[]>([]);
  readonly activo = input<SeccionTags | null>(null);

  readonly pedirEdicion = output<SeccionTags>();
  readonly guardar = output<GuardarTagsEvento>();
  readonly cancelar = output<void>();

  protected readonly draftTags = signal<string[]>([]);
  protected readonly tagBusqueda = signal('');

  /**
   * Habilidades se agrupa por categoría (son ~95 opciones); Áreas de interés
   * es una lista chica y queda en un único grupo sin encabezado.
   */
  protected readonly opcionesFiltradas = computed<GrupoOpcionesTag[]>(() => {
    const seccion = this.activo();
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

  /** Solo compara contra los valores actuales cuando esta sección es la que está activa. */
  readonly hayCambiosSinGuardar = computed(() => {
    const seccion = this.activo();
    if (!seccion) return false;
    const originales = seccion === 'habilidades' ? this.habilidades() : this.areasInteres();
    const actuales = this.draftTags();
    return (
      originales.length !== actuales.length || originales.some((tag, i) => tag !== actuales[i])
    );
  });

  constructor() {
    // Se reinicializa el draft solo cuando el padre activa esta sección (no
    // ante cualquier cambio de `habilidades`/`areasInteres`, para no pisar
    // una edición en curso si el perfil se actualiza por otro lado).
    effect(() => {
      const seccion = this.activo();
      if (!seccion) return;
      untracked(() => {
        const actuales = seccion === 'habilidades' ? this.habilidades() : this.areasInteres();
        this.draftTags.set([...actuales]);
        this.tagBusqueda.set('');
      });
    });
  }

  protected onEditar(seccion: SeccionTags): void {
    this.pedirEdicion.emit(seccion);
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

  protected onGuardar(): void {
    const seccion = this.activo();
    if (!seccion) return;
    this.guardar.emit({ seccion, tags: this.draftTags() });
  }

  protected onCancelar(): void {
    this.cancelar.emit();
  }
}
