import { IsNotEmpty, IsString } from 'class-validator';

/** Body de PATCH /solicitudes-empresas/:id/rechazar. */
export class RechazarSolicitudDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
  motivo_rechazo!: string;
}
