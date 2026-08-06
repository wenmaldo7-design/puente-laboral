import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { credentialsInterceptor } from './core/http/credentials-interceptor';
import { Auth } from './features/auth/services/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideRouter(routes),
    // Resuelve si la cookie de sesion sigue vigente ANTES de renderizar,
    // asi los guards ya tienen el dato listo y no hay flash de "deslogueado".
    provideAppInitializer(() => {
      const auth = inject(Auth);
      return auth.cargarSesion();
    }),
  ],
};
