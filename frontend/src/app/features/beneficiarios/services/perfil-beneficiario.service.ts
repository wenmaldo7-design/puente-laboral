import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PerfilBeneficiario } from '../models/perfil-beneficiario.model';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

const MOCK_PERFIL: PerfilBeneficiario = {
  nombre: 'Camila Gómez',
  rol: 'Desarrolladora Trainee',
  avatarIniciales: 'CG',
  email: 'camila.gomez@example.com',
  dni: '30123456',
  ubicacion: 'Córdoba, Argentina',
  sobreMi:
    'Estoy dando mis primeros pasos en tecnología. Me interesa el desarrollo web y busco mi primera oportunidad laboral en el rubro.',
  experiencia: [
    {
      id: 'exp-1',
      titulo: 'Asistente de Soporte IT',
      organizacion: 'Cooperativa Trabajo Digno',
      fecha: '2024 - Actualidad',
      detalle: 'Atención a usuarios y resolución de incidentes técnicos de primer nivel.',
    },
    {
      id: 'exp-2',
      titulo: 'Pasantía administrativa',
      organizacion: 'Municipalidad de Córdoba',
      fecha: '2022 - 2023',
      detalle: 'Gestión de trámites y atención al público.',
    },
  ],
  educacion: [
    {
      id: 'edu-1',
      titulo: 'Tecnicatura en Programación',
      organizacion: 'Instituto Aprender',
      fecha: '2023 - Actualidad',
      detalle: 'Formación en desarrollo web full stack.',
    },
    {
      id: 'edu-2',
      titulo: 'Bachiller en Gestión',
      organizacion: 'Escuela Técnica N.º 12',
      fecha: '2016 - 2021',
      detalle: '',
    },
  ],
  habilidades: ['HTML', 'CSS', 'JavaScript', 'Atención al cliente'],
  areasInteres: ['Desarrollo web', 'Mentorías', 'Trabajo en equipo'],
  enlaces: {
    linkedin: 'https://linkedin.com/in/camila-gomez',
    github: 'https://github.com/camilagomez',
    cvUrl: '',
  },
};

/**
 * El backend todavía no tiene los endpoints de perfil de beneficiario.
 * `getPerfil` devuelve un mock con la misma forma que va a tener la
 * respuesta HTTP real, para que reemplazarlo por `this.http.get(...)`
 * no requiera tocar el componente que lo consume.
 */
@Injectable({ providedIn: 'root' })
export class PerfilBeneficiarioService {
  constructor(private readonly http: HttpClient) {}

  private get apiUrl(): string {
    return window.__env?.apiUrl ?? 'http://localhost:3000';
  }

  getPerfil(): Observable<PerfilBeneficiario> {
    // return this.http.get<PerfilBeneficiario>(`${this.apiUrl}/beneficiarios/me/perfil`);
    return of(MOCK_PERFIL);
  }
}
