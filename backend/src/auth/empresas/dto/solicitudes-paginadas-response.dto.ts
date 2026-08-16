import { SolicitudEmpresaResponseDto } from './solicitud-empresa-response.dto';

/** Shape de respuesta de GET /solicitudes-empresas (listado paginado). */
export interface SolicitudesPaginadasResponseDto {
  data: SolicitudEmpresaResponseDto[];
  total: number;
  page: number;
  limit: number;
}
