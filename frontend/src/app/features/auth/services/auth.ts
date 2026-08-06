import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { Beneficiario } from '../models/beneficiario.model';
import { LoginDto } from '../models/login.dto';
import { RegisterBeneficiarioDto } from '../models/register-beneficiario.dto';
import { SesionUsuario } from '../models/sesion-usuario.model';

/**
 * Unica fuente de verdad del estado de sesion en el front.
 * Ningun componente llama a HttpClient directo contra /auth/*, siempre
 * pasa por aca.
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/auth/beneficiarios`;

  private readonly sesionState = signal<SesionUsuario | null>(null);
  // true mientras se resuelve la sesion inicial (al arrancar la app).
  // Evita que un guard eche al usuario antes de saber si la cookie es valida.
  private readonly resolviendoState = signal(true);

  readonly sesion = this.sesionState.asReadonly();
  readonly resolviendo = this.resolviendoState.asReadonly();
  readonly estaLogueado = computed(() => this.sesionState() !== null);

  async registrar(dto: RegisterBeneficiarioDto): Promise<Beneficiario> {
    return firstValueFrom(
      this.http.post<Beneficiario>(`${this.baseUrl}/register`, dto),
    );
  }

  async login(dto: LoginDto): Promise<void> {
    await firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/login`, dto),
    );
    await this.cargarSesion();
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/logout`, {}));
    this.sesionState.set(null);
  }

  /**
   * Se llama una vez al arrancar la app (ver app.config.ts) para saber
   * si la cookie firmada sigue vigente, sin que el usuario tenga que
   * loguearse de nuevo en cada refresh.
   */
  async cargarSesion(): Promise<void> {
    this.resolviendoState.set(true);
    try {
      const sesion = await firstValueFrom(
        this.http.get<SesionUsuario>(`${this.baseUrl}/me`),
      );
      this.sesionState.set(sesion);
    } catch {
      this.sesionState.set(null);
    } finally {
      this.resolviendoState.set(false);
    }
  }
}
