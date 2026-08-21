import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { InscripcionesMentorias } from './inscripciones-mentorias';

describe('InscripcionesMentorias', () => {
  let service: InscripcionesMentorias;
  let httpMock: HttpTestingController;

  const inscripcionDto = {
    id_inscripcion: 10,
    id_servicio: 1,
    titulo_mentoria: 'Primeros pasos en programación web',
    estado_mentoria: 'inscrito',
    fecha_inscripcion: '2026-08-20T00:00:00.000Z',
    fecha_actualizacion: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InscripcionesMentorias);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should inscribirse a una mentoría', async () => {
    const promise = firstValueFrom(service.inscribirse(1));

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/mentorias/1/inscripciones');
    expect(req.request.method).toBe('POST');
    req.flush(inscripcionDto);

    const inscripcion = await promise;
    expect(inscripcion.estado).toBe('inscrito');
    expect(inscripcion.mentoriaId).toBe(1);
  });

  it('should dar de baja una inscripción', async () => {
    const promise = firstValueFrom(service.darDeBaja(1));

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/mentorias/1/inscripciones');
    expect(req.request.method).toBe('DELETE');
    req.flush({ ...inscripcionDto, estado_mentoria: 'cancelado' });

    const inscripcion = await promise;
    expect(inscripcion.estado).toBe('cancelado');
  });
});
