import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import { PerfilBeneficiarioService } from '../../services/perfil-beneficiario.service';
import {
  EnlacesPerfil,
  EntradaTrayectoria,
  HabilidadCatalogo,
  PerfilBeneficiario,
} from '../../models/perfil-beneficiario.model';

type TipoTrayectoria = 'experiencia' | 'educacion';
type CampoSimple = 'fechaNacimiento' | 'ubicacion' | 'direccion' | 'telefono';
type SeccionTags = 'habilidades' | 'areasInteres';
type ClaveEdicion = CampoSimple | 'sobreMi' | 'enlaces' | SeccionTags | `${TipoTrayectoria}:${string}`;

/** Grupo de opciones del dropdown de tags. `categoria` es null para catálogos sin agrupar. */
interface GrupoOpcionesTag {
  categoria: string | null;
  opciones: string[];
}

/** Solo dígitos, agrupados como "351-555-0102"; recorta a 10 dígitos. */
function formatearTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 10);
  const grupos = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 10)].filter(Boolean);
  return grupos.join('-');
}

@Component({
  selector: 'app-perfil-beneficiario-page',
  imports: [DatePipe, ReactiveFormsModule, Header, Footer],
  templateUrl: './perfil-beneficiario-page.html',
  styleUrl: './perfil-beneficiario-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilBeneficiarioPage implements OnInit {
  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly perfil = signal<PerfilBeneficiario | null>(null);
  protected readonly notificacionesNoLeidas = signal(2);

  protected readonly nombreSaludo = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');

  protected readonly edicionActiva = signal<ClaveEdicion | null>(null);

  protected readonly campoSimpleForm = this.fb.group({
    fechaNacimiento: [''],
    ubicacion: [''],
    direccion: [''],
    telefono: [''],
  });

  protected readonly draftSobreMi = signal('');
  protected readonly draftEnlaces = signal<EnlacesPerfil>({ linkedin: '', github: '', cvUrl: '' });
  protected readonly draftEntrada = signal<EntradaTrayectoria | null>(null);

  protected readonly catalogoHabilidades = toSignal(this.perfilBeneficiarioService.getCatalogoHabilidades(), {
    initialValue: [] as HabilidadCatalogo[],
  });
  protected readonly catalogoAreasInteres = toSignal(this.perfilBeneficiarioService.getCatalogoAreasInteres(), {
    initialValue: [] as string[],
  });
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

  constructor() {
    this.campoSimpleForm.controls.telefono.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const formateado = formatearTelefono(valor);
        if (formateado !== valor) {
          this.campoSimpleForm.controls.telefono.setValue(formateado, { emitEvent: false });
        }
      });
  }

  ngOnInit(): void {
    this.perfilBeneficiarioService.getPerfil().subscribe((perfil) => {
      this.perfil.set(perfil);
      this.campoSimpleForm.reset(this.valoresCampoSimple(perfil));
    });
  }

  private valoresCampoSimple(perfil: PerfilBeneficiario): Record<CampoSimple, string> {
    return {
      fechaNacimiento: perfil.fechaNacimiento,
      ubicacion: perfil.ubicacion,
      direccion: perfil.direccion,
      telefono: perfil.telefono,
    };
  }

  protected claveEntrada(tipo: TipoTrayectoria, id: string): ClaveEdicion {
    return `${tipo}:${id}`;
  }

  protected estaEditando(clave: ClaveEdicion): boolean {
    return this.edicionActiva() === clave;
  }

  protected cancelarEdicion(): void {
    const perfil = this.perfil();
    if (perfil) {
      this.campoSimpleForm.reset(this.valoresCampoSimple(perfil));
    }
    this.edicionActiva.set(null);
    this.draftEntrada.set(null);
    this.tagSeccionEnEdicion.set(null);
  }

  protected iniciarEdicionCampo(campo: CampoSimple): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.campoSimpleForm.controls[campo].setValue(perfil[campo]);
    this.edicionActiva.set(campo);
  }

  protected guardarCampoSimple(campo: CampoSimple): void {
    const valor = this.campoSimpleForm.controls[campo].value;
    this.perfil.update((perfil) => (perfil ? { ...perfil, [campo]: valor } : perfil));
    this.edicionActiva.set(null);
  }

  protected iniciarEdicionSobreMi(): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.draftSobreMi.set(perfil.sobreMi);
    this.edicionActiva.set('sobreMi');
  }

  protected onDraftSobreMiInput(event: Event): void {
    this.draftSobreMi.set((event.target as HTMLTextAreaElement).value);
  }

  protected guardarSobreMi(): void {
    this.perfil.update((perfil) => (perfil ? { ...perfil, sobreMi: this.draftSobreMi() } : perfil));
    this.edicionActiva.set(null);
  }

  protected iniciarEdicionEnlaces(): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.draftEnlaces.set({ ...perfil.enlaces });
    this.edicionActiva.set('enlaces');
  }

  protected onDraftEnlacesInput(campo: keyof EnlacesPerfil, event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.draftEnlaces.update((enlaces) => ({ ...enlaces, [campo]: valor }));
  }

  protected guardarEnlaces(): void {
    this.perfil.update((perfil) => (perfil ? { ...perfil, enlaces: this.draftEnlaces() } : perfil));
    this.edicionActiva.set(null);
  }

  protected iniciarEdicionEntrada(tipo: TipoTrayectoria, entrada: EntradaTrayectoria): void {
    this.draftEntrada.set({ ...entrada });
    this.edicionActiva.set(this.claveEntrada(tipo, entrada.id));
  }

  protected onDraftEntradaInput(campo: keyof EntradaTrayectoria, event: Event): void {
    const valor = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.draftEntrada.update((entrada) => (entrada ? { ...entrada, [campo]: valor } : entrada));
  }

  protected guardarEntrada(tipo: TipoTrayectoria): void {
    const draft = this.draftEntrada();
    if (!draft) return;

    this.perfil.update((perfil) => {
      if (!perfil) return perfil;
      const lista = perfil[tipo].map((entrada) => (entrada.id === draft.id ? draft : entrada));
      return { ...perfil, [tipo]: lista };
    });

    this.edicionActiva.set(null);
    this.draftEntrada.set(null);
  }

  protected iniciarEdicionTags(seccion: SeccionTags): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.tagSeccionEnEdicion.set(seccion);
    this.draftTags.set([...perfil[seccion]]);
    this.tagBusqueda.set('');
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
    this.perfil.update((perfil) => (perfil ? { ...perfil, [seccion]: this.draftTags() } : perfil));
    this.edicionActiva.set(null);
    this.tagSeccionEnEdicion.set(null);
  }
}
