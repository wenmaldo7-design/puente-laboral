import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { EmpresaPerfilResponseDto } from '../models/empresa.model';

/** Consume /auth/empresa/*: datos propios de la empresa autenticada. */
@Injectable({
  providedIn: 'root',
})
export class Empresas {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/auth/empresa`;

  /** Requiere sesión con rol 'empresa'. */
  async obtenerPerfilPropio(): Promise<EmpresaPerfilResponseDto> {
    return firstValueFrom(
      this.http.get<EmpresaPerfilResponseDto>(`${this.baseUrl}/me`),
    );
  }
}
