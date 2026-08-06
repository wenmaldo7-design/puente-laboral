import { TestBed } from '@angular/core/testing';

import { InscripcionesMentorias } from './inscripciones-mentorias';

describe('InscripcionesMentorias', () => {
  let service: InscripcionesMentorias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InscripcionesMentorias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
