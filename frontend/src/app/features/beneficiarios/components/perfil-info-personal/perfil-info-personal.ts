import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

export type CampoSimple = 'fechaNacimiento' | 'ubicacion' | 'direccion' | 'telefono';

export interface GuardarCampoEvento {
  campo: CampoSimple;
  valor: string;
}

/** Solo dígitos, agrupados como "351-555-0102"; recorta a 10 dígitos. */
function formatearTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 10);
  const grupos = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 10)].filter(Boolean);
  return grupos.join('-');
}

/**
 * Filas de datos personales editables individualmente (Fecha de
 * nacimiento, Ubicación, Dirección, Teléfono) dentro del <dl> de la
 * cabecera de perfil. Cada campo tiene su propio FormControl y se edita
 * de forma independiente entre sí (no comparten un único FormGroup, a
 * diferencia de Enlaces).
 *
 * Mismo patrón que PerfilHabilidadesSection: el padre sigue coordinando
 * `edicionActiva` para toda la página; este componente solo pinta según
 * `activo` y expone `hayCambiosSinGuardar` para que el padre confirme el
 * descarte de cambios al abrir otra edición en cualquier parte de la página.
 */
@Component({
  selector: 'app-perfil-info-personal',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './perfil-info-personal.html',
  styleUrl: './perfil-info-personal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilInfoPersonal {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly fechaNacimiento = input.required<string>();
  readonly ubicacion = input.required<string>();
  readonly direccion = input.required<string>();
  readonly telefono = input.required<string>();
  readonly activo = input<CampoSimple | null>(null);

  readonly pedirEdicion = output<CampoSimple>();
  readonly guardar = output<GuardarCampoEvento>();
  readonly cancelar = output<void>();

  protected readonly camposForm = this.fb.group({
    fechaNacimiento: [''],
    ubicacion: [''],
    direccion: [''],
    telefono: [''],
  });

  private readonly valoresActuales = computed(() => ({
    fechaNacimiento: this.fechaNacimiento(),
    ubicacion: this.ubicacion(),
    direccion: this.direccion(),
    telefono: this.telefono(),
  }));

  private readonly valorFormulario = toSignal(this.camposForm.valueChanges, {
    initialValue: this.camposForm.getRawValue(),
  });

  /** Compara contra el valor original solo mientras ese campo está activo. */
  readonly hayCambiosSinGuardar = computed(() => {
    const campo = this.activo();
    if (!campo) return false;
    return this.valorFormulario()[campo] !== this.valoresActuales()[campo];
  });

  constructor() {
    // Se reinicializa el control solo cuando el padre activa ese campo (no
    // ante cualquier cambio del input, para no pisar una edición en curso).
    effect(() => {
      const campo = this.activo();
      if (!campo) return;
      untracked(() => {
        this.camposForm.controls[campo].setValue(this.valoresActuales()[campo]);
      });
    });

    this.camposForm.controls.telefono.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const formateado = formatearTelefono(valor);
        if (formateado !== valor) {
          this.camposForm.controls.telefono.setValue(formateado, { emitEvent: false });
        }
      });
  }

  protected onEditar(campo: CampoSimple): void {
    this.pedirEdicion.emit(campo);
  }

  protected onGuardar(campo: CampoSimple): void {
    this.guardar.emit({ campo, valor: this.camposForm.controls[campo].value });
  }

  protected onCancelar(): void {
    this.cancelar.emit();
  }
}
