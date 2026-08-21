import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeBeneficiarioPage } from './home-beneficiario-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const POSTULACIONES_URL = 'http://localhost:3000/beneficiarios/postulaciones';
const OFERTAS_URL = 'http://localhost:3000/beneficiarios/ofertas-laborales';
const NOTIFICACIONES_NO_LEIDAS_URL = 'http://localhost:3000/notificaciones/no-leidas';

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

/** Respuesta real de GET /beneficiarios/postulaciones (PostulacionResponseDto[]). */
const POSTULACIONES_DTO = [
  {
    id_postulacion: 1,
    id_servicio: 10,
    titulo_oferta: 'Asistente administrativo/a',
    empresa: 'Fundación Crecer',
    fecha_postulacion: '2026-08-01',
    estado_postulacion: 'pendiente',
    cv_url: null,
    carta_presentacion: null,
  },
  {
    id_postulacion: 2,
    id_servicio: 11,
    titulo_oferta: 'Vendedor/a',
    empresa: 'Comercial Sur',
    fecha_postulacion: '2026-07-20',
    estado_postulacion: 'aceptada',
    cv_url: null,
    carta_presentacion: null,
  },
  {
    id_postulacion: 3,
    id_servicio: 12,
    titulo_oferta: 'Repositor/a',
    empresa: 'Supermercado Norte',
    fecha_postulacion: '2026-07-10',
    estado_postulacion: 'rechazada',
    cv_url: null,
    carta_presentacion: null,
  },
];

/** Respuesta real de GET /beneficiarios/ofertas-laborales (OfertaLaboralBeneficiarioResponseDto[]). */
const OFERTAS_DTO = [
  {
    id_servicio: 20,
    titulo: 'Asistente administrativo/a',
    descripcion: null,
    empresa: 'Fundación Crecer',
    area: 'Administración y oficina',
    habilidades: ['Excel'],
    tipo_contrato: 'Tiempo indeterminado',
    modalidad: 'presencial',
    salario: null,
    vacantes: 1,
    postulantes_actuales: 3,
    fecha_limite: null,
    fecha_publicacion: '2026-08-01',
    estado_publicacion: 'activa',
    match_porcentaje: 70,
    puede_postularse: true,
    motivo_no_disponible: null,
  },
  {
    id_servicio: 21,
    titulo: 'Vendedor/a',
    descripcion: null,
    empresa: 'Comercial Sur',
    area: 'Comercio y ventas',
    habilidades: ['Atención al cliente'],
    tipo_contrato: 'Plazo fijo',
    modalidad: 'presencial',
    salario: null,
    vacantes: 2,
    postulantes_actuales: 1,
    fecha_limite: null,
    fecha_publicacion: '2026-08-05',
    estado_publicacion: 'activa',
    match_porcentaje: 92,
    puede_postularse: true,
    motivo_no_disponible: null,
  },
];

function flushGetPerfil(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
}

function flushPostulaciones(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: POSTULACIONES_URL, method: 'GET' }).flush(POSTULACIONES_DTO);
}

function flushOfertas(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: OFERTAS_URL, method: 'GET' }).flush(OFERTAS_DTO);
}

function flushNotificacionesNoLeidas(httpMock: HttpTestingController, cantidad = 2): void {
  httpMock.expectOne({ url: NOTIFICACIONES_NO_LEIDAS_URL, method: 'GET' }).flush({ cantidad });
}

function flushTodo(fixture: { detectChanges(): void }, httpMock: HttpTestingController): void {
  fixture.detectChanges();
  flushGetPerfil(httpMock);
  flushPostulaciones(httpMock);
  flushOfertas(httpMock);
  flushNotificacionesNoLeidas(httpMock);
  fixture.detectChanges();
}

describe('HomeBeneficiarioPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBeneficiarioPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    flushTodo(fixture, httpMock);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the greeting with the nombre from the logged-in beneficiario, not a hardcoded one', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    flushTodo(fixture, httpMock);
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance['nombreBeneficiario']()).toBe('Camila');
    expect(compiled.querySelector('.main-title')?.textContent).toContain('Camila');
  });

  it('should compute Postulaciones/En curso/Notificaciones from real data, not hardcoded values', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    const metricas = component['metricas']();
    expect(metricas.find((m: { etiqueta: string }) => m.etiqueta === 'Postulaciones')?.valor).toBe(3);
    expect(metricas.find((m: { etiqueta: string }) => m.etiqueta === 'En curso')?.valor).toBe(1);
    expect(metricas.find((m: { etiqueta: string }) => m.etiqueta === 'Notificaciones')?.valor).toBe(2);
  });

  it('should list "Recomendado para vos" from the same ofertas laborales compatibles endpoint, sorted by match', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    const oportunidades = component['oportunidades']();
    expect(oportunidades.map((o: { titulo: string }) => o.titulo)).toEqual(['Vendedor/a', 'Asistente administrativo/a']);
    expect(oportunidades.every((o: { tipo: string }) => o.tipo === 'empleo')).toBe(true);
  });

  it('should load the mock actualizaciones', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    expect(component['actualizaciones']().length).toBeGreaterThan(0);
  });

  it('should default to the "todo" filter and show every oportunidad', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    expect(component['filtroActivo']()).toBe('todo');
    expect(component['oportunidadesFiltradas']().length).toBe(component['oportunidades']().length);
  });

  it('should filter oportunidades by the selected pill', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    component['seleccionarFiltro']('empleo');
    fixture.detectChanges();

    expect(component['oportunidadesFiltradas']().length).toBe(component['oportunidades']().length);

    component['seleccionarFiltro']('curso');
    fixture.detectChanges();

    // Todavía no hay fuente real de cursos recomendados: el filtro no rompe, solo no encuentra nada.
    expect(component['oportunidadesFiltradas']().length).toBe(0);
  });

  it('should filter oportunidades by the search term', () => {
    const fixture = TestBed.createComponent(HomeBeneficiarioPage);
    const component = fixture.componentInstance;
    flushTodo(fixture, httpMock);

    const terminoExistente = component['oportunidades']()[0].titulo.slice(0, 4);
    component['terminoBusqueda'].set(terminoExistente);
    fixture.detectChanges();

    expect(component['oportunidadesFiltradas']().length).toBeGreaterThan(0);

    component['terminoBusqueda'].set('término que no existe en ningún mock');
    fixture.detectChanges();

    expect(component['oportunidadesFiltradas']().length).toBe(0);
  });
});
