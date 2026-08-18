import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config';
import { HabilidadCatalogo, PerfilBeneficiario } from '../models/perfil-beneficiario.model';

interface CatalogoItemResponseDto {
  nombre: string;
}

interface CiudadResponseDto {
  id_ciudad: number;
  nombre: string;
  provincia: string;
}

/** Espeja BeneficiarioPerfilResponseDto del backend (GET /beneficiarios/me). */
interface BeneficiarioPerfilResponseDto {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: CiudadResponseDto | null;
  linkedin: string | null;
  github: string | null;
  cv_url: string | null;
  habilidades: string[];
  areas_interes: string[];
}

/** Solo los campos que el perfil deja editar (PATCH /beneficiarios/me). */
export interface ActualizarBeneficiarioPayload {
  fechaNacimiento?: string;
  telefono?: string;
  direccion?: string;
  linkedin?: string;
  github?: string;
  cvUrl?: string;
}

function iniciales(nombre: string, apellido: string): string {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

function aPerfil(dto: BeneficiarioPerfilResponseDto): PerfilBeneficiario {
  return {
    nombre: `${dto.nombre} ${dto.apellido}`,
    avatarIniciales: iniciales(dto.nombre, dto.apellido),
    email: dto.email,
    dni: dto.dni,
    fechaNacimiento: dto.fecha_nacimiento ?? '',
    ubicacion: dto.ciudad ? `${dto.ciudad.nombre}, ${dto.ciudad.provincia}` : '',
    direccion: dto.direccion ?? '',
    telefono: dto.telefono ?? '',
    habilidades: dto.habilidades,
    areasInteres: dto.areas_interes,
    enlaces: {
      linkedin: dto.linkedin ?? '',
      github: dto.github ?? '',
      cvUrl: dto.cv_url ?? '',
    },
  };
}

@Injectable({ providedIn: 'root' })
export class PerfilBeneficiarioService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private readonly baseUrl = `${this.config.apiUrl}/beneficiarios`;

  getPerfil(): Observable<PerfilBeneficiario> {
    return this.http
      .get<BeneficiarioPerfilResponseDto>(`${this.baseUrl}/me`)
      .pipe(map(aPerfil));
  }

  actualizarDatos(cambios: ActualizarBeneficiarioPayload): Observable<PerfilBeneficiario> {
    const body = {
      ...(cambios.fechaNacimiento !== undefined && { fecha_nacimiento: cambios.fechaNacimiento }),
      ...(cambios.telefono !== undefined && { telefono: cambios.telefono }),
      ...(cambios.direccion !== undefined && { direccion: cambios.direccion }),
      ...(cambios.linkedin !== undefined && { linkedin: cambios.linkedin }),
      ...(cambios.github !== undefined && { github: cambios.github }),
      ...(cambios.cvUrl !== undefined && { cv_url: cambios.cvUrl }),
    };
    return this.http
      .patch<BeneficiarioPerfilResponseDto>(`${this.baseUrl}/me`, body)
      .pipe(map(aPerfil));
  }

  actualizarHabilidades(habilidades: string[]): Observable<PerfilBeneficiario> {
    return this.http
      .put<BeneficiarioPerfilResponseDto>(`${this.baseUrl}/me/habilidades`, { habilidades })
      .pipe(map(aPerfil));
  }

  actualizarAreasInteres(areas: string[]): Observable<PerfilBeneficiario> {
    return this.http
      .put<BeneficiarioPerfilResponseDto>(`${this.baseUrl}/me/areas-interes`, { areas })
      .pipe(map(aPerfil));
  }

  getCatalogoHabilidades(): Observable<HabilidadCatalogo[]> {
    return this.http
      .get<CatalogoItemResponseDto[]>(`${this.config.apiUrl}/catalogos/habilidades`)
      .pipe(map((items) => items.map((i) => ({ nombre: i.nombre, categoria: null }))));
  }

  getCatalogoAreasInteres(): Observable<string[]> {
    return this.http
      .get<CatalogoItemResponseDto[]>(`${this.config.apiUrl}/catalogos/areas-interes`)
      .pipe(map((items) => items.map((i) => i.nombre)));
  }
}
