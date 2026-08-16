import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsNotBlank } from '../../auth/dto/validators/is-not-blank.validator';
import { IsNotPastDate } from '../../auth/dto/validators/is-not-past-date.validator';

const MODALIDADES_VALIDAS = ['virtual', 'presencial'] as const;
export type ModalidadOferta = (typeof MODALIDADES_VALIDAS)[number];

/**
 * POST /empresas/ofertas-laborales.
 * `area`, `tipo_contrato` y `habilidades` viajan por nombre (no por id),
 * igual que ActualizarHabilidadesDto/ActualizarAreasInteresDto en beneficiarios:
 * el service resuelve el id contra el catálogo y rechaza nombres inexistentes.
 */
export class CrearOfertaLaboralDto {
  @IsString()
  @IsNotBlank({ message: 'El título es obligatorio' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  titulo!: string;

  @IsOptional()
  @ValidateIf((o: CrearOfertaLaboralDto) => o.descripcion !== '')
  @IsString()
  descripcion?: string;

  @IsString()
  @IsNotBlank({ message: 'El área es obligatoria' })
  area!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  habilidades?: string[];

  @IsOptional()
  @ValidateIf((o: CrearOfertaLaboralDto) => o.tipo_contrato !== '')
  @IsString()
  tipo_contrato?: string;

  @IsIn(MODALIDADES_VALIDAS, {
    message: 'La modalidad debe ser "virtual" o "presencial"',
  })
  modalidad!: ModalidadOferta;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El salario debe ser un número' },
  )
  @IsPositive({ message: 'El salario debe ser un número positivo' })
  salario?: number;

  @IsInt({ message: 'Las vacantes deben ser un número entero' })
  @IsPositive({ message: 'Las vacantes deben ser un número positivo' })
  vacantes!: number;

  @IsDateString()
  @IsNotPastDate({ message: 'La fecha límite no puede ser una fecha pasada' })
  fecha_limite!: string;
}
