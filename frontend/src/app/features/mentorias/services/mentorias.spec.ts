import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { Mentorias } from './mentorias';

describe('Mentorias', () => {
  let service: Mentorias;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Mentorias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the mock mentorías list', async () => {
    const mentorias = await firstValueFrom(service.getMentorias());
    expect(mentorias.length).toBeGreaterThan(0);
  });

  it('should find a mentoría by id', async () => {
    const mentoria = await firstValueFrom(service.getMentoriaPorId('ment-1'));
    expect(mentoria?.id).toBe('ment-1');
  });

  it('should return undefined for an id that does not exist', async () => {
    const mentoria = await firstValueFrom(service.getMentoriaPorId('no-existe'));
    expect(mentoria).toBeUndefined();
  });
});
