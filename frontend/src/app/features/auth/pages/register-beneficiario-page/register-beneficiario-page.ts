import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { toRegisterBeneficiarioDto } from '../../models/register-beneficiario.mapper';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { AuthCard } from '../../../../shared/ui/auth-card/auth-card';
import { BrandHeader } from '../../../../shared/ui/brand-header/brand-header';
import { Icon } from '../../../../shared/ui/icon/icon';

const PASSWORD_COMPLEJIDAD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/;
const TELEFONO_CARACTERES_VALIDOS = /^[0-9+\-\s()]+$/;
const URL_VALIDA = /^https?:\/\/.+/;
const GITHUB_USUARIO_VALIDO = /^[a-zA-Z0-9-]+$/;
const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const ALFANUMERICO_SIN_ESPECIALES = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  return new Date(control.value) > hoy ? { fechaFutura: true } : null;
}

@Component({
  selector: 'app-register-beneficiario-page',
  imports: [ReactiveFormsModule, RouterLink, AuthCard, BrandHeader, Icon],
  templateUrl: './register-beneficiario-page.html',
  styleUrl: './register-beneficiario-page.css',
})
export class RegisterBeneficiarioPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly mostrarPassword = signal(false);
  readonly enviando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  /** Tope del date picker (formato yyyy-mm-dd): además de fechaNoFutura, evita que se pueda elegir una fecha futura desde el calendario. */
  readonly fechaMaxima = new Date().toISOString().split('T')[0];

  readonly form = this.fb.nonNullable.group({
    // Datos de acceso — no estaban en la captura, se agregan porque el
    // backend los necesita si o si para poder crear el usuario.
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
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
    nombre: [
      '',
      [Validators.required, Validators.maxLength(25), Validators.pattern(SOLO_LETRAS)],
    ],
    apellido: [
      '',
      [Validators.required, Validators.maxLength(25), Validators.pattern(SOLO_LETRAS)],
    ],
    dni: ['', [Validators.required, Validators.pattern(/^[0-9]{1,8}$/)]],
    fechaNacimiento: ['', [fechaNoFutura]],
    telefono: [
      '',
      [Validators.maxLength(15), Validators.pattern(TELEFONO_CARACTERES_VALIDOS)],
    ],
    direccion: [
      '',
      [Validators.maxLength(50), Validators.pattern(ALFANUMERICO_SIN_ESPECIALES)],
    ],
    // "Ciudad" es texto libre en el diseño, pero el backend espera
    // id_ciudad (FK numerica) — no hay todavia un catalogo/select de
    // ciudades, asi que este campo queda cargado en el form pero NO se
    // envia al backend hasta que se construya ese catalogo.
    ciudad: [''],
    githubUsuario: [
      '',
      [Validators.maxLength(39), Validators.pattern(GITHUB_USUARIO_VALIDO)],
    ],
    linkedin: ['', [Validators.pattern(URL_VALIDA), Validators.maxLength(300)]],
    cvUrl: ['', [Validators.pattern(URL_VALIDA), Validators.maxLength(300)]],
  });

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
    this.errorMensaje.set(null);
    const v = this.form.getRawValue();
    const payload = toRegisterBeneficiarioDto(v);

    try {
      await this.auth.registrar(payload);
      await this.router.navigateByUrl('/auth/login');
    } catch (err) {
      this.errorMensaje.set(this.mensajeDeError(err));
    } finally {
      this.enviando.set(false);
    }
  }

  private mensajeDeError(err: unknown): string {
    const fallback = 'No pudimos completar el registro. Probá de nuevo.';
    if (err instanceof HttpErrorResponse) {
      return extraerMensajeDeError(err.error, fallback);
    }
    return fallback;
  }
}
