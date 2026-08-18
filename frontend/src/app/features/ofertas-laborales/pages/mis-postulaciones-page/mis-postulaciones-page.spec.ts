import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MisPostulacionesPage } from './mis-postulaciones-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const POSTULACIONES_URL = 'http://localhost:3000/beneficiarios/postulaciones';

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
];

describe('MisPostulacionesPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPostulacionesPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(MisPostulacionesPage);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: POSTULACIONES_URL, method: 'GET' }).flush(POSTULACIONES_DTO);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the greeting with the nombre from the logged-in beneficiario, not a hardcoded one', () => {
    const fixture = TestBed.createComponent(MisPostulacionesPage);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: POSTULACIONES_URL, method: 'GET' }).flush(POSTULACIONES_DTO);
    fixture.detectChanges();

    expect(fixture.componentInstance['nombreBeneficiario']()).toBe('Camila');
  });

  it('should load the postulaciones from the real endpoint', () => {
    const fixture = TestBed.createComponent(MisPostulacionesPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: POSTULACIONES_URL, method: 'GET' }).flush(POSTULACIONES_DTO);

    expect(component['postulaciones']().length).toBe(1);
  });
});
