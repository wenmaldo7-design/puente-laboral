import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'organizacion/home', pathMatch: 'full' },
  {
    path: 'organizacion',
    loadChildren: () =>
      import('./features/organizaciones/organizaciones.routes').then(
        (m) => m.ORGANIZACIONES_ROUTES,
      ),
  },
  {
    path: 'organizaciones',
    redirectTo: 'organizacion/home',
  },
  { path: '**', redirectTo: 'organizacion/home' },
];
