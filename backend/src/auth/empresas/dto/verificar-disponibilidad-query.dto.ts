import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export type CampoDisponibilidad = 'cuit' | 'razon_social';

const CAMPOS_VALIDOS: readonly CampoDisponibilidad[] = ['cuit', 'razon_social'];

/** Query de GET /solicitudes-empresas/disponibilidad (validador async del form público). */
export class VerificarDisponibilidadQueryDto {
  @IsIn(CAMPOS_VALIDOS, {
    message: `campo debe ser uno de: ${CAMPOS_VALIDOS.join(', ')}`,
  })
  campo!: CampoDisponibilidad;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  valor!: string;
}
