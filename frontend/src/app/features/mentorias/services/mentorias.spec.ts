import { TestBed } from '@angular/core/testing';

import { Mentorias } from './mentorias';

describe('Mentorias', () => {
  let service: Mentorias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mentorias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
