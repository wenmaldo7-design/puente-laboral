import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [roleGuard(['administrador'])],
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then(
        (m) => m.DashboardPage,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
