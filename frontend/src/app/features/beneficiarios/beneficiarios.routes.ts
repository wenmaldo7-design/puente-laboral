import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role-guard';
import { HomeBeneficiarioPage } from './pages/home-beneficiario-page/home-beneficiario-page';
import { PerfilBeneficiarioPage } from './pages/perfil-beneficiario-page/perfil-beneficiario-page';

export const BENEFICIARIOS_ROUTES: Routes = [
  { path: '', canActivate: [roleGuard(['beneficiario'])], component: HomeBeneficiarioPage },
  { path: 'perfil', canActivate: [roleGuard(['beneficiario'])], component: PerfilBeneficiarioPage },
];
