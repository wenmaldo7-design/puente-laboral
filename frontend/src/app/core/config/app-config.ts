import { Injectable } from '@angular/core';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

/**
 * Lee la configuracion runtime inyectada por public/env.js.
 * En Docker, docker-entrypoint.sh sobrescribe ese archivo con la
 * variable de entorno API_URL antes de levantar nginx.
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfig {
  readonly apiUrl = window.__env?.apiUrl ?? 'http://localhost:3000';
}
