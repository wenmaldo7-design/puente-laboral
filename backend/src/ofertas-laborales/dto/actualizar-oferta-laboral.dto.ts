import { PartialType } from '@nestjs/mapped-types';
import { CrearOfertaLaboralDto } from './crear-oferta-laboral.dto';

export class ActualizarOfertaLaboralDto extends PartialType(CrearOfertaLaboralDto) {}
