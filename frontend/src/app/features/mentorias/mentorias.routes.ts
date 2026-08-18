import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role-guard';
import { ListadoMentoriasPage } from './pages/listado-mentorias-page/listado-mentorias-page';
import { DetalleMentoriaPage } from './pages/detalle-mentoria-page/detalle-mentoria-page';

export const MENTORIAS_ROUTES: Routes = [
  { path: '', canActivate: [roleGuard(['beneficiario'])], component: ListadoMentoriasPage },
  { path: ':id', canActivate: [roleGuard(['beneficiario'])], component: DetalleMentoriaPage },
];
