import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Guard parametrizado por rol/es permitido/s.
 * Uso en rutas: canActivate: [roleGuard(['empresa'])]
 *
 * Se define como factory (en vez de un guard fijo) porque el rol
 * permitido cambia segun la ruta, no es un valor unico para toda la app.
 */
export const roleGuard = (rolesPermitidos: SesionRol[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);
    const sesion = auth.sesion();

    if (sesion && rolesPermitidos.includes(sesion.rol)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
};

type SesionRol = 'beneficiario' | 'empresa' | 'administrador';
