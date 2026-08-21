import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ListadoMentoriasPage } from './listado-mentorias-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const MENTORIAS_URL = 'http://localhost:3000/beneficiarios/mentorias';

/** Respuesta real de GET /beneficiarios/me (BeneficiarioPerfilResponseDto). */
const PERFIL_DTO = {
  id_usuario: 1,
  email: 'camila.gomez@example.com',
  nombre: 'Camila',
  apellido: 'Gómez',
  dni: '30123456',
  fecha_nacimiento: '2001-05-14',
  telefono: '351-555-0102',
  direccion: 'Av. Colón 1234, 3º B',
  ciudad: { id_ciudad: 1, nombre: 'Córdoba', provincia: 'Córdoba' },
  linkedin: '',
  github: '',
  cv_url: '',
  habilidades: [],
  areas_interes: [],
};

/** Respuesta real de GET /beneficiarios/mentorias (MentoriaResponseDto[]). */
const MENTORIAS_DTO = [
  {
    id_servicio: 1,
    titulo: 'Primeros pasos en programación web',
    descripcion: 'Charla introductoria sobre HTML y CSS.',
    area: 'Tecnología',
    fecha: '2026-08-20T00:00:00.000Z',
    hora_inicio: '1970-01-01T18:00:00.000Z',
    modalidad: 'virtual',
    link_o_canal: 'https://meet.google.com/abc-defg-hij',
    mentor: 'Lucía Fernández',
    inscrito: false,
  },
  {
    id_servicio: 2,
    titulo: 'Cómo armar tu CV para tu primer empleo',
    descripcion: 'Taller práctico para armar un currículum claro.',
    area: 'Empleabilidad',
    fecha: '2026-08-22T00:00:00.000Z',
    hora_inicio: '1970-01-01T10:00:00.000Z',
    modalidad: 'presencial',
    link_o_canal: null,
    mentor: 'Martín Ríos',
    inscrito: false,
  },
  {
    id_servicio: 3,
    titulo: 'Introducción a la atención al cliente',
    descripcion: 'Herramientas para desempeñarte en atención al público.',
    area: 'Comercio y ventas',
    fecha: '2026-08-25T00:00:00.000Z',
    hora_inicio: '1970-01-01T16:30:00.000Z',
    modalidad: 'virtual',
    link_o_canal: 'https://zoom.us/j/123456789',
    mentor: 'Carla Gómez',
    inscrito: true,
  },
];

function flushGetPerfil(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
}

function flushMentorias(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: MENTORIAS_URL, method: 'GET' }).flush(MENTORIAS_DTO);
}

function flushTodo(fixture: { detectChanges(): void }, httpMock: HttpTestingController): void {
  fixture.detectChanges();
  flushGetPerfil(httpMock);
  flushMentorias(httpMock);
  fixture.detectChanges();
}

describe('ListadoMentoriasPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoMentoriasPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    flushTodo(fixture, httpMock);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the mentorías from the backend', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    expect(component['mentorias']().length).toBe(MENTORIAS_DTO.length);
  });

  it('should default to the "todas" filter and show every mentoría', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    expect(component['filtroActivo']()).toBe('todas');
    expect(component['mentoriasFiltradas']().length).toBe(component['mentorias']().length);
  });

  it('should filter mentorías by the selected modalidad', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    component['seleccionarFiltro']('virtual');
    fixture.detectChanges();

    const filtradas = component['mentoriasFiltradas']();
    expect(filtradas.length).toBeGreaterThan(0);
    expect(filtradas.every((mentoria) => mentoria.modalidad === 'virtual')).toBe(true);
  });

  it('should filter mentorías by the search term', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    const terminoExistente = component['mentorias']()[0].titulo.slice(0, 5);
    component['terminoBusqueda'].set(terminoExistente);
    fixture.detectChanges();

    expect(component['mentoriasFiltradas']().length).toBeGreaterThan(0);

    component['terminoBusqueda'].set('término que no existe en ningún mock');
    fixture.detectChanges();

    expect(component['mentoriasFiltradas']().length).toBe(0);
  });

  it('should render a "Ver detalle" link for each mentoría pointing to its id', () => {
    const fixture = TestBed.createComponent(ListadoMentoriasPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);
    const compiled = fixture.nativeElement as HTMLElement;

    const enlaces = Array.from(compiled.querySelectorAll('.btn-detalle')) as HTMLAnchorElement[];
    const mentorias = component['mentorias']();

    expect(enlaces.length).toBe(mentorias.length);
    expect(enlaces[0].getAttribute('href')).toContain(String(mentorias[0].id));
  });
});
