import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'empresas',
    loadChildren: () =>
      import('./features/empresas/empresas.routes').then(
        (m) => m.EMPRESAS_ROUTES,
      ),
  },
  {
    path: 'beneficiarios',
    loadChildren: () =>
      import('./features/beneficiarios/beneficiarios.routes').then(
        (m) => m.BENEFICIARIOS_ROUTES,
      ),
  },
  {
    path: 'beneficiarios/mentorias',
    loadChildren: () =>
      import('./features/mentorias/mentorias.routes').then(
        (m) => m.MENTORIAS_ROUTES,
      ),
  },
  {
    path: 'beneficiarios/ofertas-laborales',
    loadChildren: () =>
      import('./features/ofertas-laborales/ofertas-laborales.routes').then(
        (m) => m.OFERTAS_LABORALES_ROUTES,
      ),
  },
  {
    path: 'puentelaboral',
    loadComponent: () =>
      import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'puentelaboral' },
  { path: '**', redirectTo: 'puentelaboral' },
];
