import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly nombre = input('');
  readonly notificacionesNoLeidas = input(0);

  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
