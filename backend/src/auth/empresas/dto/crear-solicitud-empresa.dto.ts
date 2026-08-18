import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsNotBlank } from '../../dto/validators/is-not-blank.validator';

const TELEFONO_CARACTERES_VALIDOS = /^[0-9+\-\s()]+$/;
const PASSWORD_COMPLEJIDAD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/;
const RAZON_SOCIAL_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

/**
 * DTO del formulario público de solicitud de habilitación de empresa.
 * La contraseña se hashea inmediatamente (ver EmpresasHabilitacionService)
 * y queda guardada junto con la solicitud: no se crea ningún USUARIO
 * hasta que un administrador la apruebe.
 */
export class CrearSolicitudEmpresaDto {
  @IsString()
  @IsNotBlank({ message: 'La razón social no puede estar vacía' })
  @MaxLength(50, {
    message: 'La razón social no puede superar los 50 caracteres',
  })
  @Matches(RAZON_SOCIAL_PATTERN, {
    message: 'La razón social solo puede contener letras',
  })
  razon_social!: string;

  @IsString()
  @MaxLength(20, { message: 'El CUIT no puede superar los 20 caracteres' })
  @Matches(/^\d{2}-?\d{8}-?\d{1}$/, {
    message: 'El CUIT no es válido (formato esperado: XX-XXXXXXXX-X)',
  })
  cuit!: string;

  @IsEmail({}, { message: 'El email de contacto no es válido' })
  @MaxLength(50, {
    message: 'El email de contacto no puede superar los 50 caracteres',
  })
  email_contacto!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, {
    message: 'La contraseña no puede superar los 50 caracteres',
  })
  @Matches(PASSWORD_COMPLEJIDAD, {
    message:
      'La contraseña debe incluir mayúscula, minúscula, número y carácter especial',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(15, {
    message: 'El teléfono de contacto no puede superar los 15 caracteres',
  })
  @Matches(TELEFONO_CARACTERES_VALIDOS, {
    message: 'El teléfono de contacto contiene caracteres no válidos',
  })
  telefono_contacto?: string;

  @IsOptional()
  @IsString()
  @IsNotBlank({ message: 'La descripción no puede estar vacía' })
  @MaxLength(100, {
    message: 'La descripción no puede superar los 100 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de documentación no es válida' })
  @MaxLength(300, {
    message: 'La URL de documentación no puede superar los 300 caracteres',
  })
  documentacion_url?: string;
}
