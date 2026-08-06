import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/inicio-page/inicio-page').then((m) => m.InicioPage),
  },
  { path: '**', redirectTo: '' },
];
