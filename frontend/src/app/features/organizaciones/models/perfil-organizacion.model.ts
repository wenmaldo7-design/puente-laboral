export interface EnlacesOrganizacion {
  sitioWeb?: string;
  linkedin?: string;
  instagram?: string;
}

export interface PerfilOrganizacion {
  id: string;
  razonSocial: string;
  nombreFantasia: string;
  cuit: string; // Verificación fiscal - solo lectura
  emailInstitucional: string; // Solo lectura
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  sector: string;
  tamano: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  sobreNosotros: string;
  enlaces: EnlacesOrganizacion;
  programasInclusion: string[];
  avatarIniciales: string;
  verificada: boolean;
}
