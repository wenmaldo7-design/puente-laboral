import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
<<<<<<< HEAD
=======
import { provideRouter } from '@angular/router'; // <-- 1. Importa provideRouter
import { routes } from './app.routes';           // <-- 2. Importa tus rutas
>>>>>>> home

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
<<<<<<< HEAD
  ]
};
=======
    provideRouter(routes), // <-- 3. Agrega las rutas aquí
  ]
};
>>>>>>> home
