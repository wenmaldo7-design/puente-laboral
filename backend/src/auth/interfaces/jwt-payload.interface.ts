export type RolUsuario = 'beneficiario' | 'empresa' | 'administrador';

export interface JwtPayload {
  sub: number; // id_usuario
  email: string;
  rol: RolUsuario;
}
