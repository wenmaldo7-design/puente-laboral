import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { OfertasLaborales } from './ofertas-laborales';

const API_URL = 'http://localhost:3000';

describe('OfertasLaborales', () => {
  let service: OfertasLaborales;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OfertasLaborales);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST the DTO to /empresas/ofertas-laborales', async () => {
    const dto = {
      titulo: 'Desarrollador/a Trainee',
      area: 'Tecnología',
      habilidades: ['HTML/CSS'],
      modalidad: 'virtual' as const,
      vacantes: 2,
      fecha_limite: '2026-09-01',
    };

    const promesa = firstValueFrom(service.crear(dto));

    const req = httpMock.expectOne(`${API_URL}/empresas/ofertas-laborales`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ id_servicio: 1, ...dto, descripcion: null, tipo_contrato: null, salario: null, fecha_publicacion: '2026-08-15', estado_publicacion: 'activa' });

    await promesa;
  });

  it('should map catalog responses to plain name arrays', async () => {
    const promesa = firstValueFrom(service.getCatalogoAreas());
    httpMock.expectOne(`${API_URL}/catalogos/areas-interes`).flush([{ nombre: 'Tecnología' }, { nombre: 'Salud' }]);
    expect(await promesa).toEqual(['Tecnología', 'Salud']);
  });
});
