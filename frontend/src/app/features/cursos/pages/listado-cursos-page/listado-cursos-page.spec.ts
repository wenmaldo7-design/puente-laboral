import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ListadoCursosPage } from './listado-cursos-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const CURSOS_URL = 'http://localhost:3000/beneficiarios/cursos';

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

/** Respuesta real de GET /beneficiarios/cursos (CursoResponseDto[]). */
const CURSOS_DTO = [
  {
    id: 1,
    titulo: 'Curso Lleno',
    descripcion: 'Curso sin cupos disponibles.',
    area: 'Tecnología',
    provincia: 'Córdoba',
    fechaInicio: '2026-09-01T00:00:00.000Z',
    fechaFin: null,
    cupos: 10,
    cuposDisponibles: 0,
    modalidad: 'remoto',
    requisitos: null,
    otorgaCertificado: true,
    profesor: 'Lucía Fernández',
    matchPorcentaje: 50,
    inscrito: false,
  },
  {
    id: 2,
    titulo: 'Curso Disponible',
    descripcion: 'Curso con cupos disponibles.',
    area: 'Tecnología',
    provincia: 'Córdoba',
    fechaInicio: '2026-09-05T00:00:00.000Z',
    fechaFin: null,
    cupos: 10,
    cuposDisponibles: 5,
    modalidad: 'remoto',
    requisitos: null,
    otorgaCertificado: false,
    profesor: 'Martín Ríos',
    matchPorcentaje: 80,
    inscrito: false,
  },
];

function flushGetPerfil(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
}

function flushCursos(httpMock: HttpTestingController, dtos: unknown[] = CURSOS_DTO): void {
  httpMock.expectOne({ url: CURSOS_URL, method: 'GET' }).flush(dtos);
}

function flushTodo(fixture: { detectChanges(): void }, httpMock: HttpTestingController): void {
  fixture.detectChanges();
  flushGetPerfil(httpMock);
  flushCursos(httpMock);
  fixture.detectChanges();
}

describe('ListadoCursosPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoCursosPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    flushTodo(fixture, httpMock);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render courses with cuposDisponibles === 0', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    const titles = fixture.nativeElement.querySelectorAll('.mentoria-titulo');
    expect(titles.length).toBe(1);
    expect(titles[0].textContent).toContain('Curso Disponible');
    expect(component['cursos']().length).toBe(1);
  });

  it('should filter courses by modalidad', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    component['modalidadFilter'].set('presencial');
    fixture.detectChanges();

    expect(component['cursosFiltrados']().length).toBe(0);
  });

  it('should filter courses by search term matching titulo or profesor', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    component['terminoBusqueda'].set('Martín');
    fixture.detectChanges();

    expect(component['cursosFiltrados']().length).toBe(1);
    expect(component['cursosFiltrados']()[0].profesor).toBe('Martín Ríos');
  });

  it('should update inscrito to true when inscribirse succeeds', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    component['inscribirse'](2);
    httpMock
      .expectOne({ url: `${CURSOS_URL}/2/inscripciones`, method: 'POST' })
      .flush({});
    fixture.detectChanges();

    expect(component['cursos']().find((c) => c.id === 2)?.inscrito).toBe(true);
  });

  it('should show an error message when enrollment fails', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    component['inscribirse'](2);
    httpMock
      .expectOne({ url: `${CURSOS_URL}/2/inscripciones`, method: 'POST' })
      .flush({ message: 'No quedan cupos disponibles' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(component['errorMensaje']()).toBe('El curso está lleno y no se pudo completar la inscripción.');
  });

  it('should update inscrito to false when darseDeBaja succeeds', () => {
    const fixture = TestBed.createComponent(ListadoCursosPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);
    component['cursos'].update((cursos) => cursos.map((c) => (c.id === 2 ? { ...c, inscrito: true } : c)));

    component['darseDeBaja'](2);
    httpMock
      .expectOne({ url: `${CURSOS_URL}/2/inscripciones`, method: 'DELETE' })
      .flush({});
    fixture.detectChanges();

    expect(component['cursos']().find((c) => c.id === 2)?.inscrito).toBe(false);
  });
});
