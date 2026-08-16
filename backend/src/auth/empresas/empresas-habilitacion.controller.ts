import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import type { AuthRequest } from '../interfaces/auth-request.interface';
import { CrearSolicitudEmpresaDto } from './dto/crear-solicitud-empresa.dto';
import { DisponibilidadResponseDto } from './dto/disponibilidad-response.dto';
import { ListarSolicitudesQueryDto } from './dto/listar-solicitudes-query.dto';
import { RechazarSolicitudDto } from './dto/rechazar-solicitud.dto';
import { SolicitudEmpresaResponseDto } from './dto/solicitud-empresa-response.dto';
import { SolicitudesPaginadasResponseDto } from './dto/solicitudes-paginadas-response.dto';
import { VerificarDisponibilidadQueryDto } from './dto/verificar-disponibilidad-query.dto';
import { EmpresasHabilitacionService } from './empresas-habilitacion.service';

@Controller('solicitudes-empresas')
export class EmpresasHabilitacionController {
  constructor(
    private readonly empresasHabilitacionService: EmpresasHabilitacionService,
  ) {}

  /** Público, sin auth: alta de una solicitud de habilitación. */
  @Post()
  async crear(
    @Body() dto: CrearSolicitudEmpresaDto,
  ): Promise<SolicitudEmpresaResponseDto> {
    return this.empresasHabilitacionService.crearSolicitud(dto);
  }

  /** Público, sin auth: validador async de unicidad para el form de alta. */
  @Get('disponibilidad')
  async verificarDisponibilidad(
    @Query() query: VerificarDisponibilidadQueryDto,
  ): Promise<DisponibilidadResponseDto> {
    return this.empresasHabilitacionService.verificarDisponibilidad(
      query.campo,
      query.valor,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async listar(
    @Query() query: ListarSolicitudesQueryDto,
  ): Promise<SolicitudesPaginadasResponseDto> {
    return this.empresasHabilitacionService.listarSolicitudes(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SolicitudEmpresaResponseDto> {
    return this.empresasHabilitacionService.obtenerSolicitudPorId(id);
  }

  @Patch(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarSolicitudDto,
    @Req() req: AuthRequest,
  ): Promise<SolicitudEmpresaResponseDto> {
    return this.empresasHabilitacionService.rechazarSolicitud(
      id,
      dto,
      req.user.sub,
    );
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ): Promise<SolicitudEmpresaResponseDto> {
    return this.empresasHabilitacionService.aprobarSolicitud(id, req.user.sub);
  }
}
