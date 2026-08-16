import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

/** PUT /beneficiarios/me/habilidades: reemplaza el set completo de habilidades del beneficiario. */
export class ActualizarHabilidadesDto {
  @IsArray()
  @ArrayMaxSize(50, { message: 'No se pueden cargar más de 50 habilidades' })
  @IsString({ each: true })
  habilidades!: string[];
}
