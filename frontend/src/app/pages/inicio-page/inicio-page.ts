import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';

/**
 * Placeholder temporal: no es un "dominio" real, es solo el destino
 * post-login hasta que exista el dashboard de beneficiario/empresa/admin.
 * Se reemplaza cuando se desarrolle esa feature.
 */
@Component({
  selector: 'app-inicio-page',
  imports: [],
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.css',
})
export class InicioPage {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/auth/login');
  }
}
