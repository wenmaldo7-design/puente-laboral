import { Routes } from '@angular/router';
import { HomeBeneficiarioPage } from './pages/home-beneficiario-page/home-beneficiario-page';
import { PerfilBeneficiarioPage } from './pages/perfil-beneficiario-page/perfil-beneficiario-page';

export const BENEFICIARIOS_ROUTES: Routes = [
  { path: 'home', component: HomeBeneficiarioPage },
  { path: 'perfil', component: PerfilBeneficiarioPage },
];
