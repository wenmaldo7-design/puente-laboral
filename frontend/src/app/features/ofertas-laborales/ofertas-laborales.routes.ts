import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role-guard';
import { ListadoOfertasPage } from './pages/listado-ofertas-page/listado-ofertas-page';
import { DetalleOfertaPage } from './pages/detalle-oferta-page/detalle-oferta-page';
import { MisPostulacionesPage } from './pages/mis-postulaciones-page/mis-postulaciones-page';

export const OFERTAS_LABORALES_ROUTES: Routes = [
  { path: '', canActivate: [roleGuard(['beneficiario'])], component: ListadoOfertasPage },
  { path: 'mis-postulaciones', canActivate: [roleGuard(['beneficiario'])], component: MisPostulacionesPage },
  { path: ':id', canActivate: [roleGuard(['beneficiario'])], component: DetalleOfertaPage },
];
