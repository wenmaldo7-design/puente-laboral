import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/pages/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
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
  { path: '**', redirectTo: '' },
];
