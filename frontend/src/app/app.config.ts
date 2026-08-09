import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // <-- 1. Importa provideRouter
import { routes } from './app.routes';           // <-- 2. Importa tus rutas

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes), // <-- 3. Agrega las rutas aquí
  ]
};