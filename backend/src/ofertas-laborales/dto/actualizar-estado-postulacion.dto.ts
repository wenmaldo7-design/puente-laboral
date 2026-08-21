import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ActualizarEstadoPostulacionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pendiente', 'en_proceso', 'entrevistado', 'aceptada', 'rechazada'])
  estado: string;
}
