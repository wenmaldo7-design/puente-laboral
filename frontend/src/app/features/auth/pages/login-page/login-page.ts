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

/** Destino post-login por rol: cada uno tiene su propio home. */
const RUTA_POST_LOGIN: Record<RolLogin, string> = {
  beneficiario: '/beneficiarios/perfil',
  empresa: '/empresas/perfil',
  administrador: '/empresas/solicitudes',
};

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

  // Los 3 roles loguean contra el mismo endpoint, pero la pestaña elegida
  // viaja en el body: el backend resuelve el rol real por el email (ver
  // AuthService.validateUsuario) y rechaza si no coincide con esta pestaña,
  // así unas credenciales de beneficiario no sirven para entrar por "Empresa".
  readonly roles: RolTab[] = [
    { id: 'administrador', label: 'Administrador', icono: 'shield-check', disponible: true },
    { id: 'beneficiario', label: 'Beneficiario', icono: 'user', disponible: true },
    { id: 'empresa', label: 'Empresa', icono: 'building', disponible: true },
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
      const { email, password } = this.form.getRawValue();
      await this.auth.login({
        email: email.trim().toLowerCase(),
        password,
        rol: this.rolActivo(),
      });
      const rol = this.auth.sesion()?.rol ?? this.rolActivo();
      await this.router.navigateByUrl(RUTA_POST_LOGIN[rol]);
    } catch {
      this.errorMensaje.set('Email o contraseña incorrectos.');
    } finally {
      this.enviando.set(false);
    }
  }
}
