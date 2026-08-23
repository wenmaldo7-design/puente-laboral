import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { Auth } from '../services/auth';

/** Bloquea la ruta si no hay sesion activa. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return toObservable(auth.resolviendo).pipe(
    filter((resolviendo) => !resolviendo),
    take(1),
    map(() => (auth.estaLogueado() ? true : router.createUrlTree(['/auth/login']))),
  );
};
