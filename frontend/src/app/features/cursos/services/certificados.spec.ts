import { TestBed } from '@angular/core/testing';

import { Certificados } from './certificados';

describe('Certificados', () => {
  let service: Certificados;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Certificados);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
