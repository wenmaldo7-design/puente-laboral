import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, from, map, of, switchMap, timer } from 'rxjs';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { AuthCard } from '../../../../shared/ui/auth-card/auth-card';
import { BrandHeader } from '../../../../shared/ui/brand-header/brand-header';
import { Icon } from '../../../../shared/ui/icon/icon';
import { toCrearSolicitudEmpresaDto } from '../../models/crear-solicitud-empresa.mapper';
import { SolicitudesHabilitacion } from '../../services/solicitudes-habilitacion';

/** Formato esperado por el backend: mismo regex que CrearSolicitudEmpresaDto. */
const CUIT_PATTERN = /^\d{2}-?\d{8}-?\d{1}$/;
const CUIT_MAX_DIGITOS = 11;
const RAZON_SOCIAL_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const TELEFONO_CARACTERES_VALIDOS = /^[0-9+\-\s()]+$/;
const URL_VALIDA = /^https?:\/\/.+/;
/** Misma política de contraseña que el registro de beneficiarios. */
const PASSWORD_COMPLEJIDAD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/;

function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  return valor && valor.trim().length === 0 ? { soloEspacios: true } : null;
}

const DEBOUNCE_DISPONIBILIDAD_MS = 400;

/**
 * Validador async de unicidad: consulta GET /solicitudes-empresas/disponibilidad.
 * Debounced para no pegarle al backend en cada tecla; si la request falla
 * (red caída, etc.) no bloquea el form — el 409 del submit sigue siendo
 * la verificación final de unicidad.
 */
function disponibilidadValidator(
  solicitudes: SolicitudesHabilitacion,
  campo: 'cuit' | 'razon_social',
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const valor = (control.value as string)?.trim();
    if (!valor) {
      return of(null);
    }
    return timer(DEBOUNCE_DISPONIBILIDAD_MS).pipe(
      switchMap(() => from(solicitudes.verificarDisponibilidad(campo, valor))),
      map((res) => (res.disponible ? null : { noDisponible: true })),
      catchError(() => of(null)),
    );
  };
}

@Component({
  selector: 'app-registro-empresa-page',
  imports: [ReactiveFormsModule, RouterLink, AuthCard, BrandHeader, Icon],
  templateUrl: './registro-empresa-page.html',
  styleUrl: './registro-empresa-page.css',
})
export class RegistroEmpresaPage {
  private readonly fb = inject(FormBuilder);
  private readonly solicitudes = inject(SolicitudesHabilitacion);

  readonly mostrarPassword = signal(false);
  readonly enviando = signal(false);
  readonly enviado = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    razon_social: [
      '',
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(RAZON_SOCIAL_PATTERN),
        noSoloEspacios,
      ],
      [disponibilidadValidator(this.solicitudes, 'razon_social')],
    ],
    cuit: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(CUIT_PATTERN),
      ],
      [disponibilidadValidator(this.solicitudes, 'cuit')],
    ],
    email_contacto: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(50)],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern(PASSWORD_COMPLEJIDAD),
      ],
    ],
    confirmarPassword: ['', [Validators.required]],
    telefono_contacto: [
      '',
      [Validators.maxLength(15), Validators.pattern(TELEFONO_CARACTERES_VALIDOS)],
    ],
    descripcion: ['', [Validators.maxLength(100)]],
    documentacion_url: [
      '',
      [Validators.maxLength(300), Validators.pattern(URL_VALIDA)],
    ],
  });

  /**
   * Filtra en cada tecla lo que no sea dígito y corta a 11 (CUIT sin
   * guiones tiene 11 dígitos: XX-XXXXXXXX-X). El pattern del submit sigue
   * siendo la validación real; esto es solo para que no se pueda escribir
   * de más en el input.
   */
  soloNumerosCuit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, CUIT_MAX_DIGITOS);
    if (limpio !== input.value) {
      input.value = limpio;
      this.form.controls.cuit.setValue(limpio);
    }
  }

  /** Filtra en cada tecla números y caracteres especiales: solo letras y espacios. */
  soloLetras(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    if (limpio !== input.value) {
      input.value = limpio;
      this.form.controls.razon_social.setValue(limpio);
    }
  }

  /** Cross-field a mano (no un Validator de grupo) para no tipar AbstractControl<any> en strict mode. */
  verificarCoincidencia(): void {
    const { password, confirmarPassword } = this.form.controls;
    if (confirmarPassword.value && confirmarPassword.value !== password.value) {
      confirmarPassword.setErrors({ noCoincide: true });
    } else if (confirmarPassword.hasError('noCoincide')) {
      confirmarPassword.setErrors(null);
    }
  }

  async enviar(): Promise<void> {
    this.verificarCoincidencia();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorGeneral.set(null);

    try {
      await this.solicitudes.crear(
        toCrearSolicitudEmpresaDto(this.form.getRawValue()),
      );
      this.enviado.set(true);
    } catch (err) {
      this.manejarError(err);
    } finally {
      this.enviando.set(false);
    }
  }

  private manejarError(err: unknown): void {
    // El backend devuelve 409 por duplicado de CUIT, razón social o email
    // de contacto en este endpoint (contra EMPRESAS o contra una solicitud
    // ya PENDIENTE): se enruta al campo correspondiente según el mensaje,
    // en vez de mostrar una alerta genérica.
    if (err instanceof HttpErrorResponse && err.status === 409) {
      const mensaje = extraerMensajeDeError(err.error, 'Ese dato ya está registrado.');
      this.controlDuplicado(mensaje).setErrors({ duplicado: mensaje });
      return;
    }

    this.errorGeneral.set(
      extraerMensajeDeError(
        err instanceof HttpErrorResponse ? err.error : null,
        'No pudimos enviar la solicitud. Probá de nuevo.',
      ),
    );
  }

  private controlDuplicado(mensaje: string): AbstractControl {
    const mensajeMinuscula = mensaje.toLowerCase();
    if (mensajeMinuscula.includes('razón social')) {
      return this.form.controls.razon_social;
    }
    if (mensajeMinuscula.includes('email')) {
      return this.form.controls.email_contacto;
    }
    return this.form.controls.cuit;
  }
}
