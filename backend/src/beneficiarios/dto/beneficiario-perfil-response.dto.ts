/** Ciudad + provincia del beneficiario (CIUDADES/PROVINCIAS), si la cargó. */
export interface CiudadResponseDto {
  id_ciudad: number;
  nombre: string;
  provincia: string;
}

/** Respuesta de GET /beneficiarios/me: perfil propio del beneficiario autenticado. */
export interface BeneficiarioPerfilResponseDto {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: Date | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: CiudadResponseDto | null;
  linkedin: string | null;
  github: string | null;
  cv_url: string | null;
  habilidades: string[];
  areas_interes: string[];
}
