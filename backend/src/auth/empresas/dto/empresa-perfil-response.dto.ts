/** Respuesta de GET /auth/empresa/me: perfil propio de la empresa autenticada. */
export interface EmpresaPerfilResponseDto {
  id_usuario: number;
  email: string;
  razon_social: string;
  cuit: string;
  descripcion: string | null;
  sitio_web: string | null;
  logo_url: string | null;
  habilitada_operativamente: boolean;
  fecha_habilitacion: Date | null;
}
