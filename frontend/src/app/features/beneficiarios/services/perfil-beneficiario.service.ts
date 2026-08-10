import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HabilidadCatalogo, PerfilBeneficiario } from '../models/perfil-beneficiario.model';

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
 *
 * Cada entrada trae su `categoria` para poder agrupar el dropdown de
 * autocompletado (son ~95 opciones, muchas para una lista plana). El orden
 * de las categorías es el orden en el que aparecen acá.
 */
const CATALOGO_HABILIDADES: HabilidadCatalogo[] = [
  // Construcción y oficios
  { nombre: 'Albañilería', categoria: 'Construcción y oficios' },
  { nombre: 'Electricidad básica', categoria: 'Construcción y oficios' },
  { nombre: 'Plomería', categoria: 'Construcción y oficios' },
  { nombre: 'Carpintería', categoria: 'Construcción y oficios' },
  { nombre: 'Pintura de obra', categoria: 'Construcción y oficios' },
  { nombre: 'Soldadura', categoria: 'Construcción y oficios' },
  { nombre: 'Colocación de pisos y cerámicos', categoria: 'Construcción y oficios' },
  { nombre: 'Techista', categoria: 'Construcción y oficios' },
  { nombre: 'Yesero / durlock', categoria: 'Construcción y oficios' },
  // Gastronomía
  { nombre: 'Cocina', categoria: 'Gastronomía' },
  { nombre: 'Panadería y pastelería', categoria: 'Gastronomía' },
  { nombre: 'Manejo de alimentos', categoria: 'Gastronomía' },
  { nombre: 'Mozo/moza / atención en salón', categoria: 'Gastronomía' },
  { nombre: 'Bartender', categoria: 'Gastronomía' },
  { nombre: 'Cocina en food truck / ambulante', categoria: 'Gastronomía' },
  // Hotelería y turismo
  { nombre: 'Recepción de hotel', categoria: 'Hotelería y turismo' },
  { nombre: 'Camarera de pisos', categoria: 'Hotelería y turismo' },
  { nombre: 'Guía turístico', categoria: 'Hotelería y turismo' },
  { nombre: 'Atención en eventos', categoria: 'Hotelería y turismo' },
  // Cuidado de personas
  { nombre: 'Cuidado de niños', categoria: 'Cuidado de personas' },
  { nombre: 'Cuidado de adultos mayores', categoria: 'Cuidado de personas' },
  { nombre: 'Primeros auxilios', categoria: 'Cuidado de personas' },
  { nombre: 'Acompañamiento terapéutico', categoria: 'Cuidado de personas' },
  { nombre: 'Enfermería / auxiliar de enfermería', categoria: 'Cuidado de personas' },
  { nombre: 'Cuidados paliativos', categoria: 'Cuidado de personas' },
  // Cuidado de animales
  { nombre: 'Paseador de perros', categoria: 'Cuidado de animales' },
  { nombre: 'Cuidado y adiestramiento de mascotas', categoria: 'Cuidado de animales' },
  { nombre: 'Auxiliar veterinario', categoria: 'Cuidado de animales' },
  // Textil y costura
  { nombre: 'Costura', categoria: 'Textil y costura' },
  { nombre: 'Tejido', categoria: 'Textil y costura' },
  { nombre: 'Manualidades y artesanías', categoria: 'Textil y costura' },
  { nombre: 'Marroquinería / trabajo en cuero', categoria: 'Textil y costura' },
  // Logística y transporte
  { nombre: 'Manejo de autoelevador', categoria: 'Logística y transporte' },
  { nombre: 'Carnet de conducir', categoria: 'Logística y transporte' },
  { nombre: 'Logística y depósito', categoria: 'Logística y transporte' },
  { nombre: 'Reparto y delivery', categoria: 'Logística y transporte' },
  { nombre: 'Manejo de camiones (carnet profesional)', categoria: 'Logística y transporte' },
  // Producción y fábrica
  { nombre: 'Trabajo en línea de producción', categoria: 'Producción y fábrica' },
  { nombre: 'Control de calidad', categoria: 'Producción y fábrica' },
  { nombre: 'Empaque y embalaje', categoria: 'Producción y fábrica' },
  { nombre: 'Manejo de maquinaria industrial', categoria: 'Producción y fábrica' },
  // Limpieza y mantenimiento
  { nombre: 'Limpieza general', categoria: 'Limpieza y mantenimiento' },
  { nombre: 'Limpieza industrial', categoria: 'Limpieza y mantenimiento' },
  { nombre: 'Mantenimiento de espacios verdes', categoria: 'Limpieza y mantenimiento' },
  { nombre: 'Jardinería', categoria: 'Limpieza y mantenimiento' },
  // Comercio y ventas
  { nombre: 'Ventas', categoria: 'Comercio y ventas' },
  { nombre: 'Manejo de caja', categoria: 'Comercio y ventas' },
  { nombre: 'Atención al cliente', categoria: 'Comercio y ventas' },
  { nombre: 'Merchandising / exhibición de productos', categoria: 'Comercio y ventas' },
  { nombre: 'Vendedor ambulante / ferias', categoria: 'Comercio y ventas' },
  // Administración y oficina
  { nombre: 'Excel', categoria: 'Administración y oficina' },
  { nombre: 'Manejo de PC básico', categoria: 'Administración y oficina' },
  { nombre: 'Gestión de trámites', categoria: 'Administración y oficina' },
  { nombre: 'Contabilidad básica', categoria: 'Administración y oficina' },
  { nombre: 'Atención telefónica / call center', categoria: 'Administración y oficina' },
  // Desarrollo web / Tecnología
  { nombre: 'HTML/CSS', categoria: 'Desarrollo web / Tecnología' },
  { nombre: 'Soporte técnico IT', categoria: 'Desarrollo web / Tecnología' },
  { nombre: 'Diseño gráfico', categoria: 'Desarrollo web / Tecnología' },
  { nombre: 'Edición de video', categoria: 'Desarrollo web / Tecnología' },
  { nombre: 'Redes sociales / community management', categoria: 'Desarrollo web / Tecnología' },
  // Belleza y estética
  { nombre: 'Peluquería', categoria: 'Belleza y estética' },
  { nombre: 'Manicuría', categoria: 'Belleza y estética' },
  { nombre: 'Maquillaje', categoria: 'Belleza y estética' },
  { nombre: 'Barbería', categoria: 'Belleza y estética' },
  // Agro y producción
  { nombre: 'Trabajo rural / agropecuario', categoria: 'Agro y producción' },
  { nombre: 'Manejo de maquinaria agrícola', categoria: 'Agro y producción' },
  { nombre: 'Viveros y producción vegetal', categoria: 'Agro y producción' },
  { nombre: 'Apicultura', categoria: 'Agro y producción' },
  // Seguridad
  { nombre: 'Vigilancia y seguridad', categoria: 'Seguridad' },
  { nombre: 'Manejo de alarmas y cámaras', categoria: 'Seguridad' },
  // Mecánica y reparación
  { nombre: 'Mecánica automotriz', categoria: 'Mecánica y reparación' },
  { nombre: 'Reparación de electrodomésticos', categoria: 'Mecánica y reparación' },
  { nombre: 'Reparación de celulares y computadoras', categoria: 'Mecánica y reparación' },
  { nombre: 'Gasista / instalaciones de gas', categoria: 'Mecánica y reparación' },
  { nombre: 'Refrigeración y aire acondicionado', categoria: 'Mecánica y reparación' },
  // Idiomas
  { nombre: 'Inglés básico', categoria: 'Idiomas' },
  { nombre: 'Inglés intermedio', categoria: 'Idiomas' },
  { nombre: 'Portugués', categoria: 'Idiomas' },
  // Educación
  { nombre: 'Apoyo escolar', categoria: 'Educación' },
  { nombre: 'Capacitación a adultos', categoria: 'Educación' },
  // Arte y diseño
  { nombre: 'Fotografía', categoria: 'Arte y diseño' },
  { nombre: 'Música / instrumentos', categoria: 'Arte y diseño' },
  { nombre: 'Cerámica', categoria: 'Arte y diseño' },
  { nombre: 'Carpintería artística', categoria: 'Arte y diseño' },
  // Deportes y actividad física
  { nombre: 'Entrenamiento físico / personal trainer', categoria: 'Deportes y actividad física' },
  { nombre: 'Instructor de yoga', categoria: 'Deportes y actividad física' },
  { nombre: 'Salvavidas', categoria: 'Deportes y actividad física' },
  // Trabajo social
  { nombre: 'Trabajo social', categoria: 'Trabajo social' },
  { nombre: 'Mediación de conflictos', categoria: 'Trabajo social' },
  { nombre: 'Promotor comunitario / de salud', categoria: 'Trabajo social' },
  // Habilidades blandas
  { nombre: 'Trabajo en equipo', categoria: 'Habilidades blandas' },
  { nombre: 'Comunicación efectiva', categoria: 'Habilidades blandas' },
  { nombre: 'Organización y puntualidad', categoria: 'Habilidades blandas' },
  { nombre: 'Resolución de problemas', categoria: 'Habilidades blandas' },
  { nombre: 'Liderazgo', categoria: 'Habilidades blandas' },
];

const CATALOGO_AREAS_INTERES: string[] = [
  'Construcción y oficios',
  'Gastronomía',
  'Hotelería y turismo',
  'Cuidado de personas',
  'Salud y bienestar',
  'Cuidado de animales',
  'Textil y costura',
  'Logística y transporte',
  'Producción y fábrica',
  'Limpieza y mantenimiento',
  'Comercio y ventas',
  'Administración y oficina',
  'Desarrollo web / Tecnología',
  'Belleza y estética',
  'Agro y producción',
  'Seguridad',
  'Idiomas',
  'Educación',
  'Arte y diseño',
  'Mecánica y reparación',
  'Deportes y actividad física',
  'Trabajo social',
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

  getCatalogoHabilidades(): Observable<HabilidadCatalogo[]> {
    // return this.http.get<HabilidadCatalogo[]>(`${this.apiUrl}/catalogos/habilidades`);
    return of(CATALOGO_HABILIDADES);
  }

  getCatalogoAreasInteres(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/catalogos/areas-interes`);
    return of(CATALOGO_AREAS_INTERES);
  }
}
