import { HttpInterceptorFn } from '@angular/common/http';

/**
 * El backend maneja el JWT unicamente via cookie firmada (httpOnly),
 * nunca por header. Sin withCredentials:true el navegador ni manda
 * ni guarda esa cookie, aunque el backend la setee bien.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
