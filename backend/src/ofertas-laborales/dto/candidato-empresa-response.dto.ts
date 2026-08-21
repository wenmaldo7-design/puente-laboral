export class CandidatoEmpresaResponseDto {
  id_postulacion!: number;
  id_usuario_beneficiario!: number;
  nombre!: string;
  apellido!: string;
  email!: string;
  fecha_postulacion!: Date;
  estado_postulacion!: string;
  cv_url?: string | null;
  carta_presentacion?: string | null;
}
