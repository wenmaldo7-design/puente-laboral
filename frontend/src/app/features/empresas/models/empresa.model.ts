/** Espeja EmpresaPerfilResponseDto del backend (GET /auth/empresa/me). */
export interface EmpresaPerfilResponseDto {
  id_usuario: number;
  email: string;
  razon_social: string;
  cuit: string;
  descripcion: string | null;
  sitio_web: string | null;
  logo_url: string | null;
  habilitada_operativamente: boolean;
  fecha_habilitacion: string | null;
}
