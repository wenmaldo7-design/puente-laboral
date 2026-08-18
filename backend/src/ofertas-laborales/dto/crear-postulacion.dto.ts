import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

/** POST /beneficiarios/ofertas-laborales/:id/postulaciones. cv_url sale del perfil del beneficiario, no se pide de nuevo. */
export class CrearPostulacionDto {
  @IsOptional()
  @ValidateIf((o: CrearPostulacionDto) => o.carta_presentacion !== '')
  @IsString()
  @MaxLength(2000, {
    message: 'La carta de presentación no puede superar los 2000 caracteres',
  })
  carta_presentacion?: string;
}
