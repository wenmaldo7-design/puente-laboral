import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Header } from '../../../../shared/ui/header/header';
import { Footer } from '../../../../shared/ui/footer/footer';
import {
  GuardarTagsEvento,
  PerfilHabilidadesSection,
  SeccionTags,
} from '../../components/perfil-habilidades-section/perfil-habilidades-section';
import { PerfilBeneficiarioService } from '../../services/perfil-beneficiario.service';
import { EntradaTrayectoria, HabilidadCatalogo, PerfilBeneficiario } from '../../models/perfil-beneficiario.model';

type TipoTrayectoria = 'experiencia' | 'educacion';
type CampoSimple = 'fechaNacimiento' | 'ubicacion' | 'direccion' | 'telefono';
type ClaveEdicion = CampoSimple | 'sobreMi' | 'enlaces' | SeccionTags | `${TipoTrayectoria}:${string}`;

/** Solo dígitos, agrupados como "351-555-0102"; recorta a 10 dígitos. */
function formatearTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 10);
  const grupos = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 10)].filter(Boolean);
  return grupos.join('-');
}

@Component({
  selector: 'app-perfil-beneficiario-page',
  imports: [DatePipe, ReactiveFormsModule, Header, Footer, PerfilHabilidadesSection],
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

  protected readonly sobreMiControl = this.fb.control('');
  protected readonly enlacesForm = this.fb.group({
    linkedin: [''],
    github: [''],
    cvUrl: [''],
  });
  protected readonly entradaForm = this.fb.group({
    titulo: [''],
    organizacion: [''],
    fecha: [''],
    detalle: [''],
  });

  protected readonly catalogoHabilidades = toSignal(this.perfilBeneficiarioService.getCatalogoHabilidades(), {
    initialValue: [] as HabilidadCatalogo[],
  });
  protected readonly catalogoAreasInteres = toSignal(this.perfilBeneficiarioService.getCatalogoAreasInteres(), {
    initialValue: [] as string[],
  });

  /** Qué sección de tags está activa (o null), derivado de `edicionActiva` para pasarlo al hijo. */
  protected readonly activoTags = computed<SeccionTags | null>(() => {
    const activa = this.edicionActiva();
    return activa === 'habilidades' || activa === 'areasInteres' ? activa : null;
  });

  private readonly habilidadesSection = viewChild(PerfilHabilidadesSection);

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
      this.sobreMiControl.setValue(perfil.sobreMi);
      this.enlacesForm.reset(perfil.enlaces);
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
      this.sobreMiControl.reset(perfil.sobreMi);
      this.enlacesForm.reset(perfil.enlaces);
    }
    this.edicionActiva.set(null);
  }

  /**
   * Antes de abrir otra edición, si la que está activa tiene cambios sin
   * guardar, confirma con el usuario que quiere descartarlos.
   */
  private puedeAbrirNuevaEdicion(): boolean {
    const activa = this.edicionActiva();
    if (!activa || !this.hayCambiosSinGuardar(activa)) return true;
    return confirm('Tenés cambios sin guardar, ¿querés descartarlos?');
  }

  private hayCambiosSinGuardar(clave: ClaveEdicion): boolean {
    if (clave === 'sobreMi') return this.sobreMiControl.dirty;
    if (clave === 'enlaces') return this.enlacesForm.dirty;
    if (clave === 'habilidades' || clave === 'areasInteres') {
      return this.habilidadesSection()?.hayCambiosSinGuardar() ?? false;
    }
    if (clave.includes(':')) return this.entradaForm.dirty;
    return this.campoSimpleForm.controls[clave as CampoSimple].dirty;
  }

  protected iniciarEdicionCampo(campo: CampoSimple): void {
    if (!this.puedeAbrirNuevaEdicion()) return;
    const perfil = this.perfil();
    if (!perfil) return;
    this.campoSimpleForm.controls[campo].setValue(perfil[campo]);
    this.campoSimpleForm.controls[campo].markAsPristine();
    this.edicionActiva.set(campo);
  }

  protected guardarCampoSimple(campo: CampoSimple): void {
    const valor = this.campoSimpleForm.controls[campo].value;
    this.perfil.update((perfil) => (perfil ? { ...perfil, [campo]: valor } : perfil));
    this.edicionActiva.set(null);
  }

  protected iniciarEdicionSobreMi(): void {
    if (!this.puedeAbrirNuevaEdicion()) return;
    const perfil = this.perfil();
    if (!perfil) return;
    this.sobreMiControl.setValue(perfil.sobreMi);
    this.sobreMiControl.markAsPristine();
    this.edicionActiva.set('sobreMi');
  }

  protected guardarSobreMi(): void {
    const valor = this.sobreMiControl.value;
    this.perfil.update((perfil) => (perfil ? { ...perfil, sobreMi: valor } : perfil));
    this.edicionActiva.set(null);
  }

  protected iniciarEdicionEnlaces(): void {
    if (!this.puedeAbrirNuevaEdicion()) return;
    const perfil = this.perfil();
    if (!perfil) return;
    this.enlacesForm.setValue(perfil.enlaces);
    this.enlacesForm.markAsPristine();
    this.edicionActiva.set('enlaces');
  }

  protected guardarEnlaces(): void {
    const valor = this.enlacesForm.getRawValue();
    this.perfil.update((perfil) => (perfil ? { ...perfil, enlaces: valor } : perfil));
    this.edicionActiva.set(null);
  }

  protected iniciarEdicionEntrada(tipo: TipoTrayectoria, entrada: EntradaTrayectoria): void {
    if (!this.puedeAbrirNuevaEdicion()) return;
    this.entradaForm.setValue({
      titulo: entrada.titulo,
      organizacion: entrada.organizacion,
      fecha: entrada.fecha,
      detalle: entrada.detalle,
    });
    this.entradaForm.markAsPristine();
    this.edicionActiva.set(this.claveEntrada(tipo, entrada.id));
  }

  protected guardarEntrada(tipo: TipoTrayectoria, id: string): void {
    const valor = this.entradaForm.getRawValue();

    this.perfil.update((perfil) => {
      if (!perfil) return perfil;
      const lista = perfil[tipo].map((entrada) => (entrada.id === id ? { ...entrada, ...valor } : entrada));
      return { ...perfil, [tipo]: lista };
    });

    this.edicionActiva.set(null);
  }

  protected onPedirEdicionTags(seccion: SeccionTags): void {
    if (!this.puedeAbrirNuevaEdicion()) return;
    this.edicionActiva.set(seccion);
  }

  protected onGuardarTags(evento: GuardarTagsEvento): void {
    this.perfil.update((perfil) => (perfil ? { ...perfil, [evento.seccion]: evento.tags } : perfil));
    this.edicionActiva.set(null);
  }
}
