import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register-beneficiario-page/register-beneficiario-page').then(
        (m) => m.RegisterBeneficiarioPage,
      ),
  },
];
