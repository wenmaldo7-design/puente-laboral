import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { toRegisterBeneficiarioDto } from '../../models/register-beneficiario.mapper';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { AuthCard } from '../../../../shared/ui/auth-card/auth-card';
import { BrandHeader } from '../../../../shared/ui/brand-header/brand-header';
import { Icon } from '../../../../shared/ui/icon/icon';

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

  readonly form = this.fb.nonNullable.group({
    // Datos de acceso — no estaban en la captura, se agregan porque el
    // backend los necesita si o si para poder crear el usuario.
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    // Datos personales
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
    fechaNacimiento: [''],
    // Contacto y ubicacion
    telefono: [''],
    direccion: [''],
    // "Ciudad" es texto libre en el diseño, pero el backend espera
    // id_ciudad (FK numerica) — no hay todavia un catalogo/select de
    // ciudades, asi que este campo queda cargado en el form pero NO se
    // envia al backend hasta que se construya ese catalogo.
    ciudad: [''],
    // Perfil profesional
    githubUsuario: [''],
    // cv_url tampoco existe hoy en el DTO de registro del backend
    // (si o si hay que agregarlo alli primero) — mismo tratamiento que
    // "ciudad": se carga en el form, no se envia todavia.
    cvUrl: [''],
  });

  async enviar(): Promise<void> {
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
      await this.auth.login({ email: v.email, password: v.password });
      await this.router.navigateByUrl('/');
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
