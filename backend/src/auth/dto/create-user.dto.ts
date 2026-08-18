import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
  IsInt,
  IsUrl,
  Matches,
} from 'class-validator';
import { IsNotFutureDate } from './validators/is-not-future-date.validator';

const PASSWORD_COMPLEJIDAD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/;
const TELEFONO_CARACTERES_VALIDOS = /^[0-9+\-\s()]+$/;
const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const ALFANUMERICO_SIN_ESPECIALES = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

/**
 * DTO de registro para BENEFICIARIOS.
 * Obligatorios: los datos minimos de USUARIOS + identificacion de la persona.
 * Opcionales: el resto de columnas nullable de BENEFICIARIOS.
 */
export class RegisterBeneficiarioDto {
  @IsEmail({}, { message: 'El email no es valido' })
  @MaxLength(150, { message: 'El email no puede superar los 150 caracteres' })
  email!: string;

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

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(25, { message: 'El nombre no puede superar los 25 caracteres' })
  @Matches(SOLO_LETRAS, { message: 'El nombre solo puede contener letras' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(25, {
    message: 'El apellido no puede superar los 25 caracteres',
  })
  @Matches(SOLO_LETRAS, { message: 'El apellido solo puede contener letras' })
  apellido!: string;

  @IsString()
  @Matches(/^[0-9]{1,8}$/, {
    message: 'El DNI debe contener solo números (máximo 8 dígitos)',
  })
  dni!: string;

  @IsOptional()
  @IsDateString()
  @IsNotFutureDate({ message: 'La fecha de nacimiento no puede ser futura' })
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15, { message: 'El teléfono no puede superar los 15 caracteres' })
  @Matches(TELEFONO_CARACTERES_VALIDOS, {
    message: 'El teléfono contiene caracteres no válidos',
  })
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'La dirección no puede superar los 50 caracteres',
  })
  @Matches(ALFANUMERICO_SIN_ESPECIALES, {
    message: 'La dirección no puede contener caracteres especiales',
  })
  direccion?: string;

  @IsOptional()
  @IsInt()
  id_ciudad?: number;

  @IsOptional()
  @IsUrl({}, { message: 'El LinkedIn debe ser una URL válida' })
  @MaxLength(300, {
    message: 'El LinkedIn no puede superar los 300 caracteres',
  })
  linkedin?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El GitHub debe ser una URL válida' })
  @MaxLength(300, { message: 'El GitHub no puede superar los 300 caracteres' })
  github?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El CV debe ser una URL válida' })
  @MaxLength(300, { message: 'El CV no puede superar los 300 caracteres' })
  cv_url?: string;
}
