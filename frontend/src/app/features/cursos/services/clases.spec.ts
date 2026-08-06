import { TestBed } from '@angular/core/testing';

import { Clases } from './clases';

describe('Clases', () => {
  let service: Clases;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clases);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
