export interface EnlacesPerfil {
  linkedin: string;
  github: string;
  cvUrl: string;
}

/** `categoria` es null: HABILIDADES no tiene columna de categoría en el schema real. */
export interface HabilidadCatalogo {
  nombre: string;
  categoria: string | null;
}

/**
 * Solo campos que existen de verdad en BENEFICIARIOS (+ USUARIOS/CIUDADES/
 * catálogos relacionados). No hay "sobre mí", "experiencia" ni "educación"
 * en la base — esas secciones no están en este perfil.
 */
export interface PerfilBeneficiario {
  nombre: string;
  avatarIniciales: string;
  email: string;
  dni: string;
  fechaNacimiento: string;
  /** Ciudad + provincia (CIUDADES/PROVINCIAS). Vacío si no cargó id_ciudad. Sin editor todavía: no hay catálogo/select de ciudades en el front. */
  ubicacion: string;
  direccion: string;
  telefono: string;
  habilidades: string[];
  areasInteres: string[];
  enlaces: EnlacesPerfil;
}
