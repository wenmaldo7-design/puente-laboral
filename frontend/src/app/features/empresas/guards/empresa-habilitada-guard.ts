import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Empresas } from '../services/empresas';

/**
 * Solo deja pasar a empresas con habilitada_operativamente=true.
 * Se asume que roleGuard(['empresa']) ya corrió antes en la misma ruta
 * (garantiza que hay sesión de empresa antes de pedir /auth/empresa/me).
 */
export const empresaHabilitadaGuard: CanActivateFn = async () => {
  const empresas = inject(Empresas);
  const router = inject(Router);

  try {
    const perfil = await empresas.obtenerPerfilPropio();
    return perfil.habilitada_operativamente || router.createUrlTree(['/']);
  } catch {
    return router.createUrlTree(['/']);
  }
};
