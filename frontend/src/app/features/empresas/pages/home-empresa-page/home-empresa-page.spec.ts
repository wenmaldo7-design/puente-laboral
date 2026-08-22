import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeEmpresaPage } from './home-empresa-page';

describe('HomeEmpresaPage', () => {
  let component: HomeEmpresaPage;
  let fixture: ComponentFixture<HomeEmpresaPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEmpresaPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);

    httpMock.expectOne('http://localhost:3000/auth/empresa/me').flush({
      id_usuario: 101,
      email: 'contacto@innovartech.org.ar',
      razon_social: 'InnovarTech',
      cuit: '30-71234567-9',
      descripcion: 'Empresa de tecnología comprometida con la inclusión laboral.',
      sitio_web: 'https://innovartech.org.ar',
      logo_url: null,
      habilitada_operativamente: true,
      fecha_habilitacion: '2026-01-01',
    });

    httpMock.expectOne('http://localhost:3000/empresas/metricas').flush({
      oportunidades_activas: 2,
      postulaciones_totales: 5,
      postulaciones_pendientes: 3,
      match_promedio: 78,
    });

    httpMock.expectOne('http://localhost:3000/empresas/ofertas-laborales').flush([
      {
        id_servicio: 1,
        titulo: 'Desarrollador Angular Trainee',
        tipo_servicio: 'oferta_laboral',
        estado_publicacion: 'activa',
        modalidad: 'virtual',
        fecha_publicacion: '2026-08-01T00:00:00.000Z',
        postulaciones_count: 4,
        nuevas_postulaciones_count: 2,
      },
      {
        id_servicio: 2,
        titulo: 'Asistente de Soporte Técnico',
        tipo_servicio: 'oferta_laboral',
        estado_publicacion: 'cerrada',
        modalidad: 'presencial',
        fecha_publicacion: '2026-07-15T00:00:00.000Z',
        postulaciones_count: 1,
        nuevas_postulaciones_count: 0,
      },
    ]);

    httpMock.expectOne('http://localhost:3000/empresas/postulaciones/recientes').flush([
      {
        id_postulacion: 1,
        beneficiario_nombre: 'Camila Morales',
        avatar_iniciales: 'CM',
        oferta_titulo: 'Desarrollador Angular Trainee',
        id_servicio: 1,
        match_porcentaje: 95,
        fecha_postulacion: '2026-08-03T00:00:00.000Z',
        estado_postulacion: 'pendiente',
      },
    ]);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have working brand and user header links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brandLink = compiled.querySelector('a.brand') as HTMLAnchorElement;
    const userLink = compiled.querySelector('a.header-user') as HTMLAnchorElement;

    expect(brandLink).toBeTruthy();
    expect(brandLink.getAttribute('routerlink') ?? brandLink.getAttribute('href')).toBeTruthy();
    expect(userLink).toBeTruthy();
    expect(userLink.getAttribute('routerlink') ?? userLink.getAttribute('href')).toBeTruthy();
  });

  it('should render main organization dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain('Panel de Empresa');
  });

  it('should render real metrics from the API, not mocked values', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const valores = Array.from(compiled.querySelectorAll('.metric-valor')).map((el) => el.textContent?.trim());
    expect(valores).toEqual(['2', '5', '3', '78%']);
  });

  it('should render opportunities and postulantes fetched from the API', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.oportunidad-card').length).toBe(2);
    expect(compiled.querySelectorAll('.postulante-card').length).toBe(1);
    expect(compiled.querySelector('.postulante-nombre')?.textContent).toContain('Camila Morales');
  });

  it('should filter opportunities by search term', () => {
    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const titulos = fixture.nativeElement.querySelectorAll('.oportunidad-titulo');
    expect(titulos.length).toBe(1);
    expect(titulos[0].textContent).toContain('Angular');
  });

  it('should filter opportunities by estado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chips = Array.from(compiled.querySelectorAll('.chip')) as HTMLButtonElement[];
    const cerradaChip = chips.find((c) => c.textContent?.trim() === 'Cerradas');
    cerradaChip?.click();
    fixture.detectChanges();

    const titulos = compiled.querySelectorAll('.oportunidad-titulo');
    expect(titulos.length).toBe(1);
    expect(titulos[0].textContent).toContain('Soporte Técnico');
  });

  it('should not show pagination controls when there are 3 or fewer postulantes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pagination')).toBeNull();
  });
});

function postulanteDto(id: number) {
  return {
    id_postulacion: id,
    beneficiario_nombre: `Postulante ${id}`,
    avatar_iniciales: 'PP',
    oferta_titulo: 'Desarrollador Angular Trainee',
    id_servicio: 1,
    match_porcentaje: 80,
    fecha_postulacion: '2026-08-03T00:00:00.000Z',
    estado_postulacion: 'pendiente',
  };
}

describe('HomeEmpresaPage postulantes pagination', () => {
  let component: HomeEmpresaPage;
  let fixture: ComponentFixture<HomeEmpresaPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEmpresaPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);

    httpMock.expectOne('http://localhost:3000/auth/empresa/me').flush({
      id_usuario: 101,
      email: 'contacto@innovartech.org.ar',
      razon_social: 'InnovarTech',
      cuit: '30-71234567-9',
      descripcion: null,
      sitio_web: null,
      logo_url: null,
      habilitada_operativamente: true,
      fecha_habilitacion: '2026-01-01',
    });
    httpMock.expectOne('http://localhost:3000/empresas/metricas').flush({
      oportunidades_activas: 0,
      postulaciones_totales: 0,
      postulaciones_pendientes: 0,
      match_promedio: 0,
    });
    httpMock.expectOne('http://localhost:3000/empresas/ofertas-laborales').flush([]);
    httpMock
      .expectOne('http://localhost:3000/empresas/postulaciones/recientes')
      .flush([1, 2, 3, 4, 5].map(postulanteDto));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show only the first page of 3 postulantes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.postulante-card').length).toBe(3);
    expect(compiled.querySelector('.pagination')?.textContent).toContain('Página 1 de 2');
  });

  it('should disable "Anterior" on the first page and enable "Siguiente"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const [anterior, siguiente] = Array.from(compiled.querySelectorAll('.pagination button')) as HTMLButtonElement[];

    expect(anterior.disabled).toBe(true);
    expect(siguiente.disabled).toBe(false);
  });

  it('should advance to the next page and show the remaining postulantes', () => {
    component['paginaSiguiente']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.postulante-card').length).toBe(2);
    expect(compiled.querySelector('.pagination')?.textContent).toContain('Página 2 de 2');

    const [anterior, siguiente] = Array.from(compiled.querySelectorAll('.pagination button')) as HTMLButtonElement[];
    expect(anterior.disabled).toBe(false);
    expect(siguiente.disabled).toBe(true);
  });

  it('should not go past the last page or before the first page', () => {
    component['paginaSiguiente']();
    component['paginaSiguiente']();
    expect(component['paginaActual']()).toBe(1);

    component['paginaAnterior']();
    component['paginaAnterior']();
    expect(component['paginaActual']()).toBe(0);
  });
});
