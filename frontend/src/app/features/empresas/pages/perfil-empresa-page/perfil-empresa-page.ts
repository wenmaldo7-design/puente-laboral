import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../../auth/services/auth';
import { extraerMensajeDeError } from '../../../../core/http/api-error';
import { PerfilEmpresaService } from '../../services/perfil-empresa.service';
import { PerfilEmpresa } from '../../models/perfil-empresa.model';
import { Header } from '../../../../shared/ui/header/header';

type SeccionEdicion = 'sobreNosotros' | 'sitioWeb';

@Component({
  selector: 'app-perfil-empresa-page',
  imports: [DatePipe, CommonModule, Header],
  templateUrl: './perfil-empresa-page.html',
  styleUrl: './perfil-empresa-page.css',
})
export class PerfilEmpresaPage implements OnInit {
  protected readonly perfil = signal<PerfilEmpresa | null>(null);
  protected readonly notificacionesNoLeidas = signal(12);

  protected readonly edicionActiva = signal<SeccionEdicion | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorGuardado = signal<string | null>(null);

  protected readonly draftSobreNosotros = signal('');
  protected readonly draftSitioWeb = signal('');

  private readonly perfilService = inject(PerfilEmpresaService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.perfilService.getPerfil().subscribe((p) => this.perfil.set(p));
  }

  protected async cerrarSesion(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  protected iniciarEdicion(seccion: SeccionEdicion): void {
    const p = this.perfil();
    if (!p) return;

    this.errorGuardado.set(null);
    this.edicionActiva.set(seccion);

    if (seccion === 'sobreNosotros') {
      this.draftSobreNosotros.set(p.sobreNosotros);
    } else {
      this.draftSitioWeb.set(p.sitioWeb);
    }
  }

  protected cancelarEdicion(): void {
    this.edicionActiva.set(null);
    this.errorGuardado.set(null);
  }

  protected onDraftSobreNosotrosInput(event: Event): void {
    this.draftSobreNosotros.set((event.target as HTMLTextAreaElement).value);
  }

  protected onDraftSitioWebInput(event: Event): void {
    this.draftSitioWeb.set((event.target as HTMLInputElement).value);
  }

  protected guardarEdicion(seccion: SeccionEdicion): void {
    const cambios =
      seccion === 'sobreNosotros'
        ? { sobreNosotros: this.draftSobreNosotros().trim() }
        : { sitioWeb: this.draftSitioWeb().trim() };

    this.guardando.set(true);
    this.errorGuardado.set(null);
    this.perfilService.actualizarPerfil(cambios).subscribe({
      next: (pActualizado) => {
        this.perfil.set(pActualizado);
        this.guardando.set(false);
        this.edicionActiva.set(null);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.errorGuardado.set(this.mensajeDeError(err));
      },
    });
  }

  private mensajeDeError(err: unknown): string {
    const fallback = 'No pudimos guardar los cambios. Probá de nuevo.';
    if (err instanceof HttpErrorResponse) {
      return extraerMensajeDeError(err.error, fallback);
    }
    return fallback;
  }
}
