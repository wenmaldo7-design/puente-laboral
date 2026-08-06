/** Payload del JWT devuelto por GET /auth/beneficiarios/me */
export interface SesionUsuario {
  sub: number;
  email: string;
  rol: 'beneficiario' | 'empresa' | 'administrador';
  iat: number;
  exp: number;
}
