import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

/** PUT /beneficiarios/me/areas-interes: reemplaza el set completo de áreas de interés del beneficiario. */
export class ActualizarAreasInteresDto {
  @IsArray()
  @ArrayMaxSize(50, { message: 'No se pueden cargar más de 50 áreas de interés' })
  @IsString({ each: true })
  areas!: string[];
}
