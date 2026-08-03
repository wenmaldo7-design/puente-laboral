import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PerfilBeneficiarioService } from '../../services/perfil-beneficiario.service';
import { EnlacesPerfil, EntradaTrayectoria, PerfilBeneficiario } from '../../models/perfil-beneficiario.model';

type TipoTrayectoria = 'experiencia' | 'educacion';
type CampoSimple = 'fechaNacimiento' | 'ubicacion' | 'direccion' | 'telefono';
type ClaveEdicion = CampoSimple | 'sobreMi' | 'enlaces' | `${TipoTrayectoria}:${string}`;

@Component({
  selector: 'app-perfil-beneficiario-page',
  imports: [DatePipe],
  templateUrl: './perfil-beneficiario-page.html',
  styleUrl: './perfil-beneficiario-page.css',
})
export class PerfilBeneficiarioPage implements OnInit {
  protected readonly perfil = signal<PerfilBeneficiario | null>(null);
  protected readonly notificacionesNoLeidas = signal(2);

  protected readonly nombreSaludo = computed(() => this.perfil()?.nombre.split(' ')[0] ?? '');

  protected readonly edicionActiva = signal<ClaveEdicion | null>(null);
  protected readonly draftCampoSimple = signal('');
  protected readonly draftSobreMi = signal('');
  protected readonly draftEnlaces = signal<EnlacesPerfil>({ linkedin: '', github: '', cvUrl: '' });
  protected readonly draftEntrada = signal<EntradaTrayectoria | null>(null);

  private readonly perfilBeneficiarioService = inject(PerfilBeneficiarioService);
  private campoSimpleEnEdicion: CampoSimple | null = null;

  ngOnInit(): void {
    this.perfilBeneficiarioService.getPerfil().subscribe((perfil) => this.perfil.set(perfil));
  }

  protected claveEntrada(tipo: TipoTrayectoria, id: string): ClaveEdicion {
    return `${tipo}:${id}`;
  }

  protected estaEditando(clave: ClaveEdicion): boolean {
    return this.edicionActiva() === clave;
  }

  protected cancelarEdicion(): void {
    this.edicionActiva.set(null);
    this.draftEntrada.set(null);
    this.campoSimpleEnEdicion = null;
  }

  protected iniciarEdicionCampo(campo: CampoSimple): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.campoSimpleEnEdicion = campo;
    this.draftCampoSimple.set(perfil[campo]);
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
    this.perfil.update((perfil) => (perfil ? { ...perfil, [campo]: this.draftCampoSimple() } : perfil));
    this.edicionActiva.set(null);
    this.campoSimpleEnEdicion = null;
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
}
