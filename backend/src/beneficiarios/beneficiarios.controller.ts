import { Body, Controller, Get, Patch, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { BeneficiariosService } from './beneficiarios.service';
import { ActualizarAreasInteresDto } from './dto/actualizar-areas-interes.dto';
import { ActualizarBeneficiarioDto } from './dto/actualizar-beneficiario.dto';
import { ActualizarHabilidadesDto } from './dto/actualizar-habilidades.dto';
import { BeneficiarioPerfilResponseDto } from './dto/beneficiario-perfil-response.dto';

@Controller('beneficiarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('beneficiario')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) {}

  @Get('me')
  async me(@Req() req: AuthRequest): Promise<BeneficiarioPerfilResponseDto> {
    return this.beneficiariosService.obtenerPerfilPropio(req.user.sub);
  }

  @Patch('me')
  async actualizar(
    @Req() req: AuthRequest,
    @Body() dto: ActualizarBeneficiarioDto,
  ): Promise<BeneficiarioPerfilResponseDto> {
    return this.beneficiariosService.actualizarDatos(req.user.sub, dto);
  }

  @Put('me/habilidades')
  async actualizarHabilidades(
    @Req() req: AuthRequest,
    @Body() dto: ActualizarHabilidadesDto,
  ): Promise<BeneficiarioPerfilResponseDto> {
    return this.beneficiariosService.actualizarHabilidades(
      req.user.sub,
      dto.habilidades,
    );
  }

  @Put('me/areas-interes')
  async actualizarAreasInteres(
    @Req() req: AuthRequest,
    @Body() dto: ActualizarAreasInteresDto,
  ): Promise<BeneficiarioPerfilResponseDto> {
    return this.beneficiariosService.actualizarAreasInteres(
      req.user.sub,
      dto.areas,
    );
  }
}
