/** Shape del cuerpo de error que devuelven las HttpException de Nest. */
export interface ApiErrorBody {
  message?: string | string[];
}

function esApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null;
}

/**
 * Extrae el mensaje de error de una respuesta HTTP fallida del backend.
 * `HttpErrorResponse.error` viene tipado `any` en Angular: esta función
 * es el único lugar donde se lo narrowea antes de usarlo.
 */
export function extraerMensajeDeError(error: unknown, fallback: string): string {
  if (esApiErrorBody(error) && error.message) {
    return Array.isArray(error.message) ? error.message[0] : error.message;
  }
  return fallback;
}
