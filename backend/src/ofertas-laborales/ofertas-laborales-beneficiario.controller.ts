import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto';
import { OfertaLaboralBeneficiarioResponseDto } from './dto/oferta-laboral-beneficiario-response.dto';
import { PostulacionResponseDto } from './dto/postulacion-response.dto';
import { OfertasLaboralesBeneficiarioService } from './ofertas-laborales-beneficiario.service';
import { PostulacionesService } from './postulaciones.service';

@Controller('beneficiarios/ofertas-laborales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('beneficiario')
export class OfertasLaboralesBeneficiarioController {
  constructor(
    private readonly ofertasLaboralesBeneficiarioService: OfertasLaboralesBeneficiarioService,
    private readonly postulacionesService: PostulacionesService,
  ) {}

  @Get()
  async listar(
    @Req() req: AuthRequest,
  ): Promise<OfertaLaboralBeneficiarioResponseDto[]> {
    return this.ofertasLaboralesBeneficiarioService.listarCompatibles(
      req.user.sub,
    );
  }

  @Get(':id')
  async detalle(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OfertaLaboralBeneficiarioResponseDto> {
    return this.ofertasLaboralesBeneficiarioService.detalle(req.user.sub, id);
  }

  @Post(':id/postulaciones')
  async postularme(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearPostulacionDto,
  ): Promise<PostulacionResponseDto> {
    return this.postulacionesService.postularme(req.user.sub, id, dto);
  }
}
