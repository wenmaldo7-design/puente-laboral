import { IsString, MaxLength, IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';

export class CreateMentoriaDto {
  @IsString()
  @MaxLength(150)
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  requisitos: string;

  @IsInt()
  duracion_minutos: number;

  @IsInt()
  id_area: number;

  @IsDateString()
  fecha: string;

  @IsString()
  hora_inicio: string; // "HH:mm"

  @IsString()
  @IsIn(['presencial', 'virtual', 'hibrida'])
  modalidad: string;

  @IsInt()
  @IsOptional()
  id_provincia?: number;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  link_o_canal?: string;
}
