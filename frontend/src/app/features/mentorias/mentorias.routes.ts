import { Routes } from '@angular/router';
import { ListadoMentoriasPage } from './pages/listado-mentorias-page/listado-mentorias-page';
import { DetalleMentoriaPage } from './pages/detalle-mentoria-page/detalle-mentoria-page';

export const MENTORIAS_ROUTES: Routes = [
  { path: '', component: ListadoMentoriasPage },
  { path: ':id', component: DetalleMentoriaPage },
];
