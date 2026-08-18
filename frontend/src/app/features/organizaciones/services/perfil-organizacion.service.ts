import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PerfilOrganizacion } from '../models/perfil-organizacion.model';

const MOCK_SECTORES: string[] = [
  'Tecnología y Software',
  'Educación y Formación',
  'Organización No Gubernamental (ONG)',
  'Salud y Bienestar',
  'Comercio y Retail',
  'Manufactura e Industria',
  'Servicios Financieros',
  'Logística y Distribución',
  'Turismo y Gastronomía',
  'Construcción e Infraestructura',
];

const MOCK_PROGRAMAS: string[] = [
  'Primer Empleo Joven',
  'Inserción Mujeres en Tecnología',
  'Becas de Formación Técnica',
  'Mentorías One-to-One',
  'Inclusión Laboral +45',
  'Diversidad e Inclusión Social',
  'Pasantías Remuneradas',
  'Capacitación en Oficios Digitales',
];

let MOCK_PERFIL: PerfilOrganizacion = {
  id: 'org-101',
  razonSocial: 'Tecnología e Innovación Social S.A.',
  nombreFantasia: 'InnovarTech',
  cuit: '30-71234567-9',
  emailInstitucional: 'contacto@innovartech.org.ar',
  telefono: '351-440-2020',
  direccion: 'Av. Colón 1250, Piso 4',
  ciudad: 'Córdoba Capital',
  provincia: 'Córdoba',
  sector: 'Tecnología y Software',
  tamano: '51-200',
  sobreNosotros:
    'Somos una empresa de tecnología comprometida con el desarrollo de software de calidad y la inclusión laboral juvenil y comunitaria a través de programas de capacitación y primeras oportunidades de empleo.',
  enlaces: {
    sitioWeb: 'https://innovartech.org.ar',
    linkedin: 'https://linkedin.com/company/innovartech',
    instagram: 'https://instagram.com/innovartech',
  },
  programasInclusion: [
    'Primer Empleo Joven',
    'Inserción Mujeres en Tecnología',
    'Becas de Formación Técnica',
    'Mentorías One-to-One',
  ],
  avatarIniciales: 'IT',
  verificada: true,
};

/**
 * Servicio de Perfil de Organización preparado para consumir los endpoints
 * del backend NestJS.
 */
@Injectable({
  providedIn: 'root',
})
export class PerfilOrganizacionService {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  getCatalogoSectores(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/organizaciones/catalogos/sectores`);
    return of(MOCK_SECTORES);
  }

  getCatalogoProgramasInclusion(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/organizaciones/catalogos/programas`);
    return of(MOCK_PROGRAMAS);
  }

  getPerfil(): Observable<PerfilOrganizacion> {
    // return this.http.get<PerfilOrganizacion>(`${this.apiUrl}/organizaciones/perfil`);
    return of({ ...MOCK_PERFIL });
  }

  actualizarPerfil(cambios: Partial<PerfilOrganizacion>): Observable<PerfilOrganizacion> {
    // return this.http.put<PerfilOrganizacion>(`${this.apiUrl}/organizaciones/perfil`, cambios);
    MOCK_PERFIL = {
      ...MOCK_PERFIL,
      ...cambios,
    };
    return of({ ...MOCK_PERFIL });
  }
}
