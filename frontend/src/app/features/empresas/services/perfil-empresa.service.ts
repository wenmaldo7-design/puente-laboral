import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { PerfilEmpresa } from '../models/perfil-empresa.model';
import { EmpresaPerfilResponseDto } from '../models/empresa.model';

/** Iniciales para el avatar a partir de la razón social (no hay "nombre de fantasía" en la DB). */
function iniciales(razonSocial: string): string {
  const palabras = razonSocial.trim().split(/\s+/).filter(Boolean);
  return palabras
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function aPerfilEmpresa(dto: EmpresaPerfilResponseDto): PerfilEmpresa {
  return {
    id: String(dto.id_usuario),
    razonSocial: dto.razon_social,
    cuit: dto.cuit,
    emailInstitucional: dto.email,
    sobreNosotros: dto.descripcion ?? '',
    sitioWeb: dto.sitio_web ?? '',
    avatarIniciales: iniciales(dto.razon_social),
    verificada: dto.habilitada_operativamente,
    fechaHabilitacion: dto.fecha_habilitacion,
  };
}

/** Solo los campos que el perfil deja editar (PATCH /auth/empresa/me). */
export interface ActualizarEmpresaPayload {
  sobreNosotros?: string;
  sitioWeb?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PerfilEmpresaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/auth/empresa`;

  getPerfil(): Observable<PerfilEmpresa> {
    return this.http
      .get<EmpresaPerfilResponseDto>(`${this.baseUrl}/me`)
      .pipe(map(aPerfilEmpresa));
  }

  actualizarPerfil(cambios: ActualizarEmpresaPayload): Observable<PerfilEmpresa> {
    const body = {
      ...(cambios.sobreNosotros !== undefined && { descripcion: cambios.sobreNosotros }),
      ...(cambios.sitioWeb !== undefined && { sitio_web: cambios.sitioWeb }),
    };
    return this.http
      .patch<EmpresaPerfilResponseDto>(`${this.baseUrl}/me`, body)
      .pipe(map(aPerfilEmpresa));
  }
}
