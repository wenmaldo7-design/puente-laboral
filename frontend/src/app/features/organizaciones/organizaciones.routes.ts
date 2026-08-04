import { Routes } from '@angular/router';
import { HomeOrganizacionPage } from './pages/home-organizacion-page/home-organizacion-page';
import { PerfilOrganizacionPage } from './pages/perfil-organizacion-page/perfil-organizacion-page';

export const ORGANIZACIONES_ROUTES: Routes = [
  { path: '', component: HomeOrganizacionPage },
  { path: 'home', component: HomeOrganizacionPage },
  { path: 'perfil', component: PerfilOrganizacionPage },
];
