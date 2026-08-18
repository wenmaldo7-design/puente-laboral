import { TestBed } from '@angular/core/testing';

import { Seguimientos } from './seguimientos';

describe('Seguimientos', () => {
  let service: Seguimientos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Seguimientos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
