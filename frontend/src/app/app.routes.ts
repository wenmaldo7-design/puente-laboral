import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/pages/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'beneficiario',
    loadChildren: () =>
      import('./features/beneficiarios/beneficiarios.routes').then((m) => m.BENEFICIARIOS_ROUTES),
  },
  {
    path: 'beneficiario/mentorias',
    loadChildren: () =>
      import('./features/mentorias/mentorias.routes').then((m) => m.MENTORIAS_ROUTES),
  },
];
