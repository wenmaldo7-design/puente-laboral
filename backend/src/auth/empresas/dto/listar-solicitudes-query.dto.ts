import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EstadoSolicitud } from '../interfaces/estado-solicitud.enum';

/** Query params de GET /solicitudes-empresas. */
export class ListarSolicitudesQueryDto {
  @IsOptional()
  @IsEnum(EstadoSolicitud, { message: 'El estado de solicitud no es válido' })
  estado?: EstadoSolicitud;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
