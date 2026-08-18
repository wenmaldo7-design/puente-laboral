/** Espeja BeneficiarioSafe del backend (nunca incluye password_hash). */
export interface Beneficiario {
  id_usuario: number;
  email: string;
  activo: boolean;
  fecha_registro: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  direccion: string | null;
  id_ciudad: number | null;
  linkedin: string | null;
  github: string | null;
  cv_url: string | null;
}
