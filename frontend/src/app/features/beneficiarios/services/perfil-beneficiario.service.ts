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
  fechaNacimiento: '2001-05-14',
  ubicacion: 'Córdoba, Argentina',
  direccion: 'Av. Colón 1234, 3º B',
  telefono: '351-555-0102',
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
  habilidades: ['Atención al cliente', 'Excel', 'HTML/CSS', 'Trabajo en equipo'],
  areasInteres: ['Desarrollo web / Tecnología', 'Mentorías', 'Primer empleo'],
  enlaces: {
    linkedin: 'https://linkedin.com/in/camila-gomez',
    github: 'https://github.com/camilagomez',
    cvUrl: '',
  },
};

/**
 * Catálogo cerrado de habilidades: el usuario solo puede elegir de esta
 * lista (no texto libre), para que el matching con oportunidades no se
 * rompa por variantes de tipeo ("Excel" vs. "excel avanzado"). Todavía no
 * existe un endpoint de catálogo en el backend; en cuanto exista, lo va a
 * administrar el rol Admin.
 */
const CATALOGO_HABILIDADES: string[] = [
  'Albañilería',
  'Electricidad básica',
  'Plomería',
  'Carpintería',
  'Pintura de obra',
  'Soldadura',
  'Cocina',
  'Panadería y pastelería',
  'Manejo de alimentos',
  'Mozo/moza / atención en salón',
  'Cuidado de niños',
  'Cuidado de adultos mayores',
  'Primeros auxilios',
  'Acompañamiento terapéutico',
  'Costura',
  'Tejido',
  'Manualidades y artesanías',
  'Manejo de autoelevador',
  'Carnet de conducir',
  'Logística y depósito',
  'Reparto y delivery',
  'Limpieza general',
  'Mantenimiento de espacios verdes',
  'Jardinería',
  'Ventas',
  'Manejo de caja',
  'Atención al cliente',
  'Excel',
  'Manejo de PC básico',
  'Gestión de trámites',
  'HTML/CSS',
  'Soporte técnico IT',
  'Peluquería',
  'Manicuría',
  'Trabajo en equipo',
  'Comunicación efectiva',
  'Organización y puntualidad',
  'Resolución de problemas',
];

const CATALOGO_AREAS_INTERES: string[] = [
  'Construcción y oficios',
  'Gastronomía',
  'Cuidado de personas',
  'Textil y costura',
  'Logística y transporte',
  'Limpieza y mantenimiento',
  'Comercio y ventas',
  'Administración y oficina',
  'Desarrollo web / Tecnología',
  'Belleza y estética',
  'Primer empleo',
  'Mentorías',
  'Capacitación y formación',
];

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

  getCatalogoHabilidades(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/catalogos/habilidades`);
    return of(CATALOGO_HABILIDADES);
  }

  getCatalogoAreasInteres(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/catalogos/areas-interes`);
    return of(CATALOGO_AREAS_INTERES);
  }
}
