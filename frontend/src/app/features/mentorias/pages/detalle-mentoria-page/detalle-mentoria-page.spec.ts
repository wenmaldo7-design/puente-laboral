import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleMentoriaPage } from './detalle-mentoria-page';

const PERFIL_URL = 'http://localhost:3000/beneficiarios/me';
const mentoriaUrl = (id: string): string => `http://localhost:3000/beneficiarios/mentorias/${id}`;
const inscripcionesUrl = (id: number): string => `http://localhost:3000/beneficiarios/mentorias/${id}/inscripciones`;

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

/** Respuesta real de GET /beneficiarios/mentorias/:id (MentoriaResponseDto), virtual con link. */
const MENTORIA_VIRTUAL_DTO = {
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
};

/** Respuesta real de GET /beneficiarios/mentorias/:id (MentoriaResponseDto), presencial sin link. */
const MENTORIA_PRESENCIAL_DTO = {
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
};

function inscripcionDto(id: number, estado: 'inscrito' | 'cancelado') {
  return {
    id_inscripcion: 100,
    id_servicio: id,
    titulo_mentoria: 'Primeros pasos en programación web',
    estado_mentoria: estado,
    fecha_inscripcion: '2026-08-20T00:00:00.000Z',
    fecha_actualizacion: null,
  };
}

async function crearFixture(
  id: string,
): Promise<{ fixture: ComponentFixture<DetalleMentoriaPage>; httpMock: HttpTestingController }> {
  await TestBed.configureTestingModule({
    imports: [DetalleMentoriaPage],
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

  return { fixture: TestBed.createComponent(DetalleMentoriaPage), httpMock: TestBed.inject(HttpTestingController) };
}

function flushGetPerfil(httpMock: HttpTestingController): void {
  httpMock.expectOne({ url: PERFIL_URL, method: 'GET' }).flush(PERFIL_DTO);
}

describe('DetalleMentoriaPage', () => {
  it('should create the component', async () => {
    const { fixture, httpMock } = await crearFixture('1');
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock.expectOne({ url: mentoriaUrl('1'), method: 'GET' }).flush(MENTORIA_VIRTUAL_DTO);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the mentoría matching the route id', async () => {
    const { fixture, httpMock } = await crearFixture('1');
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock.expectOne({ url: mentoriaUrl('1'), method: 'GET' }).flush(MENTORIA_VIRTUAL_DTO);
    fixture.detectChanges();

    expect(fixture.componentInstance['mentoria']()?.id).toBe(1);
  });

  it('should show an empty state for an id that does not exist', async () => {
    const { fixture, httpMock } = await crearFixture('999');
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock
      .expectOne({ url: mentoriaUrl('999'), method: 'GET' })
      .flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.empty-state')?.textContent).toContain('No encontramos');
  });

  it('should not reveal the access link before inscribiéndose in a virtual mentoría', async () => {
    const { fixture, httpMock } = await crearFixture('1');
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock.expectOne({ url: mentoriaUrl('1'), method: 'GET' }).flush(MENTORIA_VIRTUAL_DTO);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.link-acceso')).toBeNull();
    expect(compiled.querySelector('.btn-inscribirme')).not.toBeNull();
  });

  it('should update state and hide inscribirme button after inscribiéndose in a virtual mentoría', async () => {
    const { fixture, httpMock } = await crearFixture('1');
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock.expectOne({ url: mentoriaUrl('1'), method: 'GET' }).flush(MENTORIA_VIRTUAL_DTO);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.btn-inscribirme') as HTMLButtonElement).click();
    httpMock.expectOne({ url: inscripcionesUrl(1), method: 'POST' }).flush(inscripcionDto(1, 'inscrito'));
    fixture.detectChanges();

    expect(component['estaInscripto']()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-inscribirme')).toBeNull();
  });

  it('should not show an access link for a presencial mentoría even after inscribiéndose', async () => {
    const { fixture, httpMock } = await crearFixture('2');
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock.expectOne({ url: mentoriaUrl('2'), method: 'GET' }).flush(MENTORIA_PRESENCIAL_DTO);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.btn-inscribirme') as HTMLButtonElement).click();
    httpMock.expectOne({ url: inscripcionesUrl(2), method: 'POST' }).flush(inscripcionDto(2, 'inscrito'));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.link-acceso')).toBeNull();
    expect(compiled.querySelector('.inscripcion-confirmada')).not.toBeNull();
  });

  it('should allow darse de baja after inscribiéndose, hiding the link and showing "Inscribirme" again', async () => {
    const { fixture, httpMock } = await crearFixture('1');
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushGetPerfil(httpMock);
    httpMock.expectOne({ url: mentoriaUrl('1'), method: 'GET' }).flush(MENTORIA_VIRTUAL_DTO);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.btn-inscribirme') as HTMLButtonElement).click();
    httpMock.expectOne({ url: inscripcionesUrl(1), method: 'POST' }).flush(inscripcionDto(1, 'inscrito'));
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-baja')).not.toBeNull();

    (compiled.querySelector('.btn-baja') as HTMLButtonElement).click();
    httpMock.expectOne({ url: inscripcionesUrl(1), method: 'DELETE' }).flush(inscripcionDto(1, 'cancelado'));
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(component['estaInscripto']()).toBe(false);
    expect(compiled.querySelector('.link-acceso')).toBeNull();
    expect(compiled.querySelector('.btn-baja')).toBeNull();
    expect(compiled.querySelector('.btn-inscribirme')).not.toBeNull();
  });
});
