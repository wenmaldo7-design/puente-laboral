import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { empresaHabilitadaGuard } from './empresa-habilitada-guard';

describe('empresaHabilitadaGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => empresaHabilitadaGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
