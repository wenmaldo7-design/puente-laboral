export interface LoginDto {
  email: string;
  password: string;
  /** Pestaña elegida en el login-page: el backend rechaza si no coincide con el rol real. */
  rol: 'beneficiario' | 'empresa' | 'administrador';
}
