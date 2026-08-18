import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleOfertaPage } from './detalle-oferta-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const OFERTA_URL = 'http://localhost:3000/beneficiarios/ofertas-laborales/20';

const PERFIL_DTO = {
  id_usuario: 1,
  email: 'camila.gomez@example.com',
  nombre: 'Camila',
  apellido: 'Gómez',
  dni: '30123456',
  fecha_nacimiento: null,
  telefono: null,
  direccion: null,
  ciudad: null,
  linkedin: null,
  github: null,
  cv_url: null,
  habilidades: [],
  areas_interes: [],
};

const OFERTA_DTO = {
  id_servicio: 20,
  titulo: 'Asistente administrativo/a',
  descripcion: 'Descripción de la oferta.',
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
};

async function crearFixture(id: string): Promise<ComponentFixture<DetalleOfertaPage>> {
  await TestBed.configureTestingModule({
    imports: [DetalleOfertaPage],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
      },
    ],
  }).compileComponents();

  return TestBed.createComponent(DetalleOfertaPage);
}

describe('DetalleOfertaPage', () => {
  it('should create the component', async () => {
    const fixture = await crearFixture('20');
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: OFERTA_URL, method: 'GET' }).flush(OFERTA_DTO);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the greeting with the nombre from the logged-in beneficiario, not a hardcoded one', async () => {
    const fixture = await crearFixture('20');
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: OFERTA_URL, method: 'GET' }).flush(OFERTA_DTO);
    fixture.detectChanges();

    expect(fixture.componentInstance['nombreBeneficiario']()).toBe('Camila');
  });

  it('should load the oferta from the real endpoint', async () => {
    const fixture = await crearFixture('20');
    const component = fixture.componentInstance;
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: OFERTA_URL, method: 'GET' }).flush(OFERTA_DTO);

    expect(component['oferta']()?.titulo).toBe('Asistente administrativo/a');
  });
});
