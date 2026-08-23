import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { homeGuard } from './home-guard';
import { Auth } from '../services/auth';

const ME_URL = 'http://localhost:3000/auth/beneficiarios/me';

function sesionDto(rol: 'beneficiario' | 'empresa' | 'administrador') {
  return { sub: 1, email: 'a@a.com', rol, iat: 0, exp: 0 };
}

describe('homeGuard', () => {
  let httpMock: HttpTestingController;
  let auth: Auth;
  let router: Router;

  const runGuard = (): Observable<boolean | UrlTree> =>
    TestBed.runInInjectionContext(() => homeGuard(null as never, null as never)) as Observable<boolean | UrlTree>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(Auth);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(runGuard).toBeTruthy();
  });

  it('should not resolve while the initial session load is still pending', () => {
    const cargaSesion = auth.cargarSesion();

    let resuelto = false;
    runGuard().subscribe(() => (resuelto = true));

    expect(resuelto).toBe(false);

    httpMock.expectOne({ url: ME_URL, method: 'GET' }).flush(null, { status: 401, statusText: 'Unauthorized' });
    return cargaSesion;
  });

  it('should allow access once the initial load resolves with no active session', async () => {
    const cargaSesion = auth.cargarSesion();
    const resultado = firstValueFrom(runGuard());

    httpMock.expectOne({ url: ME_URL, method: 'GET' }).flush(null, { status: 401, statusText: 'Unauthorized' });
    await cargaSesion;

    expect(await resultado).toBe(true);
  });

  it('should redirect a beneficiario to /beneficiarios', async () => {
    const cargaSesion = auth.cargarSesion();
    const resultado = firstValueFrom(runGuard());

    httpMock.expectOne({ url: ME_URL, method: 'GET' }).flush(sesionDto('beneficiario'));
    await cargaSesion;

    expect(await resultado).toEqual(router.createUrlTree(['/beneficiarios']));
  });

  it('should redirect an empresa to /empresas/home', async () => {
    const cargaSesion = auth.cargarSesion();
    const resultado = firstValueFrom(runGuard());

    httpMock.expectOne({ url: ME_URL, method: 'GET' }).flush(sesionDto('empresa'));
    await cargaSesion;

    expect(await resultado).toEqual(router.createUrlTree(['/empresas/home']));
  });

  it('should redirect an administrador to /admin/dashboard', async () => {
    const cargaSesion = auth.cargarSesion();
    const resultado = firstValueFrom(runGuard());

    httpMock.expectOne({ url: ME_URL, method: 'GET' }).flush(sesionDto('administrador'));
    await cargaSesion;

    expect(await resultado).toEqual(router.createUrlTree(['/admin/dashboard']));
  });
});
