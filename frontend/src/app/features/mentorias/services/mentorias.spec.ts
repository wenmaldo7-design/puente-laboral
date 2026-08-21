import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { Mentorias } from './mentorias';

describe('Mentorias', () => {
  let service: Mentorias;
  let httpMock: HttpTestingController;

  const mentoriaDto = {
    id_servicio: 1,
    titulo: 'Primeros pasos en programación web',
    descripcion: 'Charla introductoria sobre HTML y CSS.',
    area: 'Tecnología',
    fecha: '2026-08-25T00:00:00.000Z',
    hora_inicio: '1970-01-01T18:00:00.000Z',
    modalidad: 'virtual',
    link_o_canal: 'https://meet.google.com/abc-defg-hij',
    mentor: 'Lucía Fernández',
    inscrito: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Mentorias);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map the mentorías list from the backend', async () => {
    const promise = firstValueFrom(service.getMentorias());

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/mentorias');
    expect(req.request.method).toBe('GET');
    req.flush([mentoriaDto]);

    const mentorias = await promise;
    expect(mentorias.length).toBe(1);
    expect(mentorias[0].id).toBe(1);
    expect(mentorias[0].mentorIniciales).toBe('LF');
    expect(mentorias[0].horaInicio).toBe('18:00');
  });

  it('should get a mentoría by id', async () => {
    const promise = firstValueFrom(service.getMentoriaPorId(1));

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/mentorias/1');
    expect(req.request.method).toBe('GET');
    req.flush(mentoriaDto);

    const mentoria = await promise;
    expect(mentoria.id).toBe(1);
  });

  it('should get mis mentorías', async () => {
    const promise = firstValueFrom(service.getMisMentorias());

    const req = httpMock.expectOne('http://localhost:3000/beneficiarios/mis-mentorias');
    expect(req.request.method).toBe('GET');
    req.flush([mentoriaDto]);

    const mentorias = await promise;
    expect(mentorias.length).toBe(1);
  });
});
