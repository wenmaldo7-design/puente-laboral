/**
 * Solo campos que existen de verdad en EMPRESAS (+ USUARIOS). No hay
 * "nombre de fantasía", teléfono, dirección, ciudad, provincia, sector,
 * tamaño ni "programas de inclusión" en la base — esas secciones no están
 * en este perfil.
 */
export interface PerfilEmpresa {
  id: string;
  razonSocial: string;
  cuit: string; // Verificación fiscal - solo lectura
  emailInstitucional: string; // Solo lectura
  sobreNosotros: string;
  sitioWeb: string;
  avatarIniciales: string;
  verificada: boolean;
  fechaHabilitacion: string | null;
}
