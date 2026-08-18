import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { InscripcionesMentorias } from './inscripciones-mentorias';

describe('InscripcionesMentorias', () => {
  let service: InscripcionesMentorias;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InscripcionesMentorias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have no inscripción before inscribirse', async () => {
    const inscripcion = await firstValueFrom(service.getInscripcionPorMentoria('ment-1'));
    expect(inscripcion).toBeUndefined();
  });

  it('should confirm an inscripción', async () => {
    const inscripcion = await firstValueFrom(service.inscribirse('ment-1'));
    expect(inscripcion.estado).toBe('confirmada');
    expect(inscripcion.mentoriaId).toBe('ment-1');
  });

  it('should cancel an existing inscripción', async () => {
    await firstValueFrom(service.inscribirse('ment-1'));
    const inscripcion = await firstValueFrom(service.darDeBaja('ment-1'));
    expect(inscripcion.estado).toBe('cancelada');
  });
});
