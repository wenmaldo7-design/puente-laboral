import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then(
        (m) => m.DashboardPage,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
