import { IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

/**
 * PATCH /auth/empresa/me: solo las columnas de EMPRESAS que el perfil deja
 * editar. `ValidateIf` permite mandar '' para borrar un campo opcional sin
 * que la validación de formato lo rechace.
 */
export class ActualizarEmpresaDto {
  @IsOptional()
  @ValidateIf((o: ActualizarEmpresaDto) => o.descripcion !== '')
  @IsString()
  @MaxLength(1000, {
    message: 'La descripción no puede superar los 1000 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @ValidateIf((o: ActualizarEmpresaDto) => o.sitio_web !== '')
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  @MaxLength(300, {
    message: 'El sitio web no puede superar los 300 caracteres',
  })
  sitio_web?: string;
}
