import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsInt,
  IsUrl,
  Matches,
} from 'class-validator';

/**
 * DTO de registro para BENEFICIARIOS.
 * Obligatorios: los datos minimos de USUARIOS + identificacion de la persona.
 * Opcionales: el resto de columnas nullable de BENEFICIARIOS.
 */
export class RegisterBeneficiarioDto {
  @IsEmail({}, { message: 'El email no es valido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsString()
  nombre!: string;

  @IsString()
  apellido!: string;

  @IsString()
  @Matches(/^[0-9]{7,10}$/, { message: 'DNI invalido' })
  dni!: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsInt()
  id_ciudad?: number;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  github?: string;
}
