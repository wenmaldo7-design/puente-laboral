import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/** Evita que alguien ya logueado vuelva a ver /auth/login o /auth/register. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogueado()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
