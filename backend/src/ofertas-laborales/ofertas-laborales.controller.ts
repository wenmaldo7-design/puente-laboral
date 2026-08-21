import { Body, Controller, Get, Patch, Delete, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { CrearOfertaLaboralDto } from './dto/crear-oferta-laboral.dto';
import { ActualizarOfertaLaboralDto } from './dto/actualizar-oferta-laboral.dto';
import { OfertaLaboralResponseDto } from './dto/oferta-laboral-response.dto';
import { OportunidadEmpresaResponseDto } from './dto/oportunidad-empresa-response.dto';
import { CandidatoEmpresaResponseDto } from './dto/candidato-empresa-response.dto';
import { OfertasLaboralesService } from './ofertas-laborales.service';

@Controller('empresas/ofertas-laborales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('empresa')
export class OfertasLaboralesController {
  constructor(
    private readonly ofertasLaboralesService: OfertasLaboralesService,
  ) {}

  @Get()
  async listar(
    @Req() req: AuthRequest,
  ): Promise<OportunidadEmpresaResponseDto[]> {
    return this.ofertasLaboralesService.listarPropias(req.user.sub);
  }

  @Post()
  async crear(
    @Req() req: AuthRequest,
    @Body() dto: CrearOfertaLaboralDto,
  ): Promise<OfertaLaboralResponseDto> {
    return this.ofertasLaboralesService.crear(req.user.sub, dto);
  }

  @Patch(':id')
  async actualizar(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarOfertaLaboralDto,
  ): Promise<OfertaLaboralResponseDto> {
    return this.ofertasLaboralesService.actualizar(req.user.sub, id, dto);
  }

  @Delete(':id')
  async eliminar(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.ofertasLaboralesService.eliminar(req.user.sub, id);
  }

  @Get(':id/candidatos')
  async obtenerCandidatos(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CandidatoEmpresaResponseDto[]> {
    return this.ofertasLaboralesService.obtenerCandidatos(req.user.sub, id);
  }
}
