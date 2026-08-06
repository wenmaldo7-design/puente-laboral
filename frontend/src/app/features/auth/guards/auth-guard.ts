import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/** Bloquea la ruta si no hay sesion activa. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
