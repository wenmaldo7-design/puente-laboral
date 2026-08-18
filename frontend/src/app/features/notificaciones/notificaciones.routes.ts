import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role-guard';
import { BandejaNotificacionesPage } from './pages/bandeja-notificaciones-page/bandeja-notificaciones-page';

export const NOTIFICACIONES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['beneficiario', 'empresa'])],
    component: BandejaNotificacionesPage,
  },
];
