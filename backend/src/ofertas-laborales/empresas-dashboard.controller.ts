import { Controller, Get, Req, UseGuards, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { EmpresaMetricasResponseDto } from './dto/empresa-metricas-response.dto';
import { PostulanteRecienteResponseDto } from './dto/postulante-reciente-response.dto';
import { EmpresasDashboardService } from './empresas-dashboard.service';
import { ActualizarEstadoPostulacionDto } from './dto/actualizar-estado-postulacion.dto';

@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('empresa')
export class EmpresasDashboardController {
  constructor(
    private readonly empresasDashboardService: EmpresasDashboardService,
  ) {}

  @Get('metricas')
  async metricas(@Req() req: AuthRequest): Promise<EmpresaMetricasResponseDto> {
    return this.empresasDashboardService.obtenerMetricas(req.user.sub);
  }

  @Get('postulaciones/recientes')
  async postulantesRecientes(
    @Req() req: AuthRequest,
  ): Promise<PostulanteRecienteResponseDto[]> {
    return this.empresasDashboardService.obtenerPostulantesRecientes(
      req.user.sub,
    );
  }

  @Patch('postulaciones/:id/estado')
  async actualizarEstadoPostulacion(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoPostulacionDto,
  ): Promise<void> {
    return this.empresasDashboardService.actualizarEstadoPostulacion(
      req.user.sub,
      id,
      dto.estado,
    );
  }
}
