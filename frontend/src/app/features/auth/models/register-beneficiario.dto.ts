/** Espeja RegisterBeneficiarioDto del backend. */
export interface RegisterBeneficiarioDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  id_ciudad?: number;
  linkedin?: string;
  github?: string;
}
