import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SolicitudesHabilitacion } from './solicitudes-habilitacion';

describe('SolicitudesHabilitacion', () => {
  let service: SolicitudesHabilitacion;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SolicitudesHabilitacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
