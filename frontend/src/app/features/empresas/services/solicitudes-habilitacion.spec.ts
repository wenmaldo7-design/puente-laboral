import { TestBed } from '@angular/core/testing';

import { SolicitudesHabilitacion } from './solicitudes-habilitacion';

describe('SolicitudesHabilitacion', () => {
  let service: SolicitudesHabilitacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudesHabilitacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
