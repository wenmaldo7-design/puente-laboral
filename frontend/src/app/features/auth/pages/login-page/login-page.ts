import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { AuthCard } from '../../../../shared/ui/auth-card/auth-card';
import { BrandHeader } from '../../../../shared/ui/brand-header/brand-header';
import { Icon, IconName } from '../../../../shared/ui/icon/icon';

type RolLogin = 'administrador' | 'beneficiario' | 'empresa';

interface RolTab {
  id: RolLogin;
  label: string;
  icono: IconName;
  disponible: boolean;
}

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AuthCard, BrandHeader, Icon],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // Solo "beneficiario" tiene backend hoy. Admin/Empresa quedan visibles
  // (fieles al diseño) pero deshabilitados hasta que se desarrollen esos
  // módulos de auth.
  readonly roles: RolTab[] = [
    { id: 'administrador', label: 'Administrador', icono: 'shield-check', disponible: false },
    { id: 'beneficiario', label: 'Beneficiario', icono: 'user', disponible: true },
    { id: 'empresa', label: 'Empresa', icono: 'building', disponible: false },
  ];

  readonly rolActivo = signal<RolLogin>('beneficiario');
  readonly mostrarPassword = signal(false);
  readonly enviando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  seleccionarRol(rol: RolTab): void {
    if (rol.disponible) {
      this.rolActivo.set(rol.id);
    }
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl('/');
    } catch {
      this.errorMensaje.set('Email o contraseña incorrectos.');
    } finally {
      this.enviando.set(false);
    }
  }
}
