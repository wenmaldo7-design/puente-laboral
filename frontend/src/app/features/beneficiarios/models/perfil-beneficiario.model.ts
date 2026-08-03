export interface EntradaTrayectoria {
  id: string;
  titulo: string;
  organizacion: string;
  fecha: string;
  detalle: string;
}

export interface EnlacesPerfil {
  linkedin: string;
  github: string;
  cvUrl: string;
}

export interface PerfilBeneficiario {
  nombre: string;
  rol: string;
  avatarIniciales: string;
  email: string;
  dni: string;
  fechaNacimiento: string;
  ubicacion: string;
  direccion: string;
  telefono: string;
  sobreMi: string;
  experiencia: EntradaTrayectoria[];
  educacion: EntradaTrayectoria[];
  habilidades: string[];
  areasInteres: string[];
  enlaces: EnlacesPerfil;
}
