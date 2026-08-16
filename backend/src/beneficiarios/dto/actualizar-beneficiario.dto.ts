import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsNotFutureDate } from '../../auth/dto/validators/is-not-future-date.validator';

const TELEFONO_CARACTERES_VALIDOS = /^[0-9+\-\s()]+$/;
const ALFANUMERICO_SIN_ESPECIALES = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

/**
 * PATCH /beneficiarios/me: solo las columnas de BENEFICIARIOS que el
 * perfil deja editar. `ValidateIf` permite mandar '' para borrar un
 * campo opcional sin que la validación de formato lo rechace.
 */
export class ActualizarBeneficiarioDto {
  @IsOptional()
  @ValidateIf((o: ActualizarBeneficiarioDto) => o.fecha_nacimiento !== '')
  @IsDateString()
  @IsNotFutureDate({ message: 'La fecha de nacimiento no puede ser futura' })
  fecha_nacimiento?: string;

  @IsOptional()
  @ValidateIf((o: ActualizarBeneficiarioDto) => o.telefono !== '')
  @IsString()
  @MaxLength(15, { message: 'El teléfono no puede superar los 15 caracteres' })
  @Matches(TELEFONO_CARACTERES_VALIDOS, {
    message: 'El teléfono contiene caracteres no válidos',
  })
  telefono?: string;

  @IsOptional()
  @ValidateIf((o: ActualizarBeneficiarioDto) => o.direccion !== '')
  @IsString()
  @MaxLength(50, {
    message: 'La dirección no puede superar los 50 caracteres',
  })
  @Matches(ALFANUMERICO_SIN_ESPECIALES, {
    message: 'La dirección no puede contener caracteres especiales',
  })
  direccion?: string;

  @IsOptional()
  @ValidateIf((o: ActualizarBeneficiarioDto) => o.linkedin !== '')
  @IsUrl({}, { message: 'El LinkedIn debe ser una URL válida' })
  @MaxLength(300, {
    message: 'El LinkedIn no puede superar los 300 caracteres',
  })
  linkedin?: string;

  @IsOptional()
  @ValidateIf((o: ActualizarBeneficiarioDto) => o.github !== '')
  @IsUrl({}, { message: 'El GitHub debe ser una URL válida' })
  @MaxLength(300, { message: 'El GitHub no puede superar los 300 caracteres' })
  github?: string;

  @IsOptional()
  @ValidateIf((o: ActualizarBeneficiarioDto) => o.cv_url !== '')
  @IsUrl({}, { message: 'El CV debe ser una URL válida' })
  @MaxLength(300, { message: 'El CV no puede superar los 300 caracteres' })
  cv_url?: string;
}
