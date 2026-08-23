import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { Cursos } from './cursos';

describe('Cursos', () => {
  let service: Cursos;
  let httpMock: HttpTestingController;

  const cursoDto = {
    id: 1,
    titulo: 'Introducción a la programación',
    descripcion: 'Curso introductorio de programación web.',
    area: 'Tecnología',
    provincia: 'Córdoba',
    fechaInicio: '2026-09-01T00:00:00.000Z',
    fechaFin: null,
    cupos: 20,
    cuposDisponibles: 15,
    modalidad: 'virtual',
    requisitos: null,
    otorgaCertificado: true,
    profesor: 'Lucía Fernández',
    matchPorcentaje: 75,
    inscrito: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Cursos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map the cursos list from the backend', async () => {
    const promise = firstValueFrom(service.getCursos());

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/cursos');
    expect(req.request.method).toBe('GET');
    req.flush([cursoDto]);

    const cursos = await promise;
    expect(cursos.length).toBe(1);
    expect(cursos[0].id).toBe(1);
    expect(cursos[0].profesor).toBe('Lucía Fernández');
  });

  it('should get a curso by id', async () => {
    const promise = firstValueFrom(service.getCursoPorId(1));

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/cursos/1');
    expect(req.request.method).toBe('GET');
    req.flush(cursoDto);

    const curso = await promise;
    expect(curso.id).toBe(1);
  });

  it('should get mis cursos', async () => {
    const promise = firstValueFrom(service.getMisCursos());

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/mis-cursos');
    expect(req.request.method).toBe('GET');
    req.flush([cursoDto]);

    const cursos = await promise;
    expect(cursos.length).toBe(1);
  });

  it('should post an inscripcion when inscribirse is called', async () => {
    const promise = firstValueFrom(service.inscribirse(1));

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/cursos/1/inscripciones');
    expect(req.request.method).toBe('POST');
    req.flush({});

    await promise;
  });

  it('should delete the inscripcion when darseDeBaja is called', async () => {
    const promise = firstValueFrom(service.darseDeBaja(1));

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/cursos/1/inscripciones');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    await promise;
  });
});
