import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role-guard';

export const EMPRESAS_ROUTES: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro-empresa-page/registro-empresa-page').then(
        (m) => m.RegistroEmpresaPage,
      ),
  },
  {
    path: 'home',
    canActivate: [roleGuard(['empresa'])],
    loadComponent: () =>
      import('./pages/home-empresa-page/home-empresa-page').then(
        (m) => m.HomeEmpresaPage,
      ),
  },
  {
    path: 'perfil',
    canActivate: [roleGuard(['empresa'])],
    loadComponent: () =>
      import('./pages/perfil-empresa-page/perfil-empresa-page').then(
        (m) => m.PerfilEmpresaPage,
      ),
  },
  {
    path: 'ofertas-laborales/publicar',
    canActivate: [roleGuard(['empresa'])],
    loadComponent: () =>
      import(
        '../ofertas-laborales/pages/publicar-oferta-page/publicar-oferta-page'
      ).then((m) => m.PublicarOfertaPage),
  },
  {
    path: 'solicitudes',
    canActivate: [roleGuard(['administrador'])],
    loadComponent: () =>
      import(
        './pages/solicitudes-pendientes-page/solicitudes-pendientes-page'
      ).then((m) => m.SolicitudesPendientesPage),
  },
  {
    path: 'solicitudes/:id',
    canActivate: [roleGuard(['administrador'])],
    loadComponent: () =>
      import('./pages/revision-solicitud-page/revision-solicitud-page').then(
        (m) => m.RevisionSolicitudPage,
      ),
  },
];
