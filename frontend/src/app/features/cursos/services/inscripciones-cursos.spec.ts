import { TestBed } from '@angular/core/testing';

import { InscripcionesCursos } from './inscripciones-cursos';

describe('InscripcionesCursos', () => {
  let service: InscripcionesCursos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InscripcionesCursos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
