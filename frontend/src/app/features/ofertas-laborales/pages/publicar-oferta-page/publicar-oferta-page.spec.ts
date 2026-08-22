import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PublicarOfertaPage } from './publicar-oferta-page';

const API_URL = 'http://localhost:3000';

async function crearFixture(): Promise<{
  fixture: ComponentFixture<PublicarOfertaPage>;
  httpMock: HttpTestingController;
}> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [PublicarOfertaPage],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(PublicarOfertaPage);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();

  httpMock.expectOne(`${API_URL}/catalogos/areas-interes`).flush([{ nombre: 'Tecnología' }]);
  httpMock
    .expectOne(`${API_URL}/catalogos/habilidades`)
    .flush([{ nombre: 'HTML/CSS' }, { nombre: 'Ventas' }]);
  httpMock.expectOne(`${API_URL}/catalogos/tipos-contrato`).flush([{ nombre: 'Plazo fijo' }]);
  httpMock.expectOne(`${API_URL}/catalogos/provincias`).flush(['Buenos Aires']);
  fixture.detectChanges();

  return { fixture, httpMock };
}

describe('PublicarOfertaPage', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the component and load the catalogs', async () => {
    const { fixture } = await crearFixture();
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component['areas']()).toEqual(['Tecnología']);
    expect(component['tiposContrato']()).toEqual(['Plazo fijo']);
    expect(component['habilidadesCatalogo']().length).toBe(2);
  });

  it('should keep the form invalid until the required fields are filled', async () => {
    const { fixture } = await crearFixture();
    const component = fixture.componentInstance;

    expect(component['form'].invalid).toBe(true);

    component['form'].setValue({
      titulo: 'Desarrollador/a Trainee',
      descripcion: '',
      area: 'Tecnología',
      tipo_contrato: '',
      modalidad: 'virtual',
      salario: null,
      vacantes: 2,
      fecha_limite: component['minFechaLimite'],
      provincia: '',
      habilidades: [],
    });

    expect(component['form'].valid).toBe(true);
  });

  it('should toggle habilidades selection', async () => {
    const { fixture } = await crearFixture();
    const component = fixture.componentInstance;

    expect(component['estaSeleccionada']('HTML/CSS')).toBe(false);
    component['toggleHabilidad']('HTML/CSS');
    expect(component['estaSeleccionada']('HTML/CSS')).toBe(true);
    component['toggleHabilidad']('HTML/CSS');
    expect(component['estaSeleccionada']('HTML/CSS')).toBe(false);
  });

  it('should submit the mapped DTO and show the confirmation on success', async () => {
    const { fixture, httpMock } = await crearFixture();
    const component = fixture.componentInstance;

    component['form'].setValue({
      titulo: '  Desarrollador/a Trainee  ',
      descripcion: '',
      area: 'Tecnología',
      tipo_contrato: '',
      modalidad: 'virtual',
      salario: null,
      vacantes: 2,
      fecha_limite: component['minFechaLimite'],
      provincia: '',
      habilidades: ['HTML/CSS'],
    });

    component['enviar']();

    const req = httpMock.expectOne(`${API_URL}/empresas/ofertas-laborales`);
    expect(req.request.body).toEqual({
      titulo: 'Desarrollador/a Trainee',
      area: 'Tecnología',
      habilidades: ['HTML/CSS'],
      modalidad: 'virtual',
      vacantes: 2,
      fecha_limite: component['minFechaLimite'],
    });

    req.flush({
      id_servicio: 1,
      titulo: 'Desarrollador/a Trainee',
      descripcion: null,
      area: 'Tecnología',
      habilidades: ['HTML/CSS'],
      tipo_contrato: null,
      modalidad: 'virtual',
      salario: null,
      vacantes: 2,
      fecha_limite: component['minFechaLimite'],
      fecha_publicacion: component['minFechaLimite'],
      estado_publicacion: 'activa',
    });

    expect(component['enviado']()).toBe(true);
  });

  it('should show an error message when the request fails', async () => {
    const { fixture, httpMock } = await crearFixture();
    const component = fixture.componentInstance;

    component['form'].setValue({
      titulo: 'Desarrollador/a Trainee',
      descripcion: '',
      area: 'Tecnología',
      tipo_contrato: '',
      modalidad: 'virtual',
      salario: null,
      vacantes: 2,
      fecha_limite: component['minFechaLimite'],
      provincia: '',
      habilidades: [],
    });

    component['enviar']();

    const req = httpMock.expectOne(`${API_URL}/empresas/ofertas-laborales`);
    req.flush({ message: 'El área seleccionada no existe en el catálogo' }, { status: 400, statusText: 'Bad Request' });

    expect(component['enviado']()).toBe(false);
    expect(component['errorGeneral']()).toBe('El área seleccionada no existe en el catálogo');
  });
});
