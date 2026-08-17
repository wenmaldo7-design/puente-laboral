import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ListadoOfertasPage } from './listado-ofertas-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const OFERTAS_URL = 'http://localhost:3000/beneficiarios/ofertas-laborales';

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
    modalidad: 'virtual',
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

describe('ListadoOfertasPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoOfertasPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ListadoOfertasPage);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: OFERTAS_URL, method: 'GET' }).flush(OFERTAS_DTO);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the greeting with the nombre from the logged-in beneficiario, not a hardcoded one', () => {
    const fixture = TestBed.createComponent(ListadoOfertasPage);
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: OFERTAS_URL, method: 'GET' }).flush(OFERTAS_DTO);
    fixture.detectChanges();

    expect(fixture.componentInstance['nombreBeneficiario']()).toBe('Camila');
  });

  it('should load the ofertas compatibles from the real endpoint', () => {
    const fixture = TestBed.createComponent(ListadoOfertasPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
    httpMock.expectOne({ url: OFERTAS_URL, method: 'GET' }).flush(OFERTAS_DTO);

    expect(component['ofertas']().length).toBe(2);
  });
});
