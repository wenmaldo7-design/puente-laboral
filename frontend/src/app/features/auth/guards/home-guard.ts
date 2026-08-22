import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { Auth } from '../services/auth';

const RUTA_POR_ROL: Record<string, string> = {
  beneficiario: '/beneficiarios',
  empresa: '/empresas/home',
  administrador: '/admin/dashboard',
};

/** Evita que alguien ya logueado vea la home pública: lo manda a su área según el rol. */
export const homeGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return toObservable(auth.resolviendo).pipe(
    filter((resolviendo) => !resolviendo),
    take(1),
    map(() => {
      if (!auth.estaLogueado()) {
        return true;
      }
      return router.createUrlTree([RUTA_POR_ROL[auth.sesion()!.rol]]);
    }),
  );
};
