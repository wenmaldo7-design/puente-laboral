import { TestBed } from '@angular/core/testing';

import { OfertasLaborales } from './ofertas-laborales';

describe('OfertasLaborales', () => {
  let service: OfertasLaborales;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfertasLaborales);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
