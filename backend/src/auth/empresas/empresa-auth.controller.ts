import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import type { AuthRequest } from '../interfaces/auth-request.interface';
import { ActualizarEmpresaDto } from './dto/actualizar-empresa.dto';
import { EmpresaPerfilResponseDto } from './dto/empresa-perfil-response.dto';
import { EmpresaAuthService } from './empresa-auth.service';

@Controller('auth/empresa')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('empresa')
export class EmpresaAuthController {
  constructor(private readonly empresaAuthService: EmpresaAuthService) {}

  @Get('me')
  async me(@Req() req: AuthRequest): Promise<EmpresaPerfilResponseDto> {
    return this.empresaAuthService.obtenerPerfilPropio(req.user.sub);
  }

  @Patch('me')
  async actualizar(
    @Req() req: AuthRequest,
    @Body() dto: ActualizarEmpresaDto,
  ): Promise<EmpresaPerfilResponseDto> {
    return this.empresaAuthService.actualizarPerfilPropio(req.user.sub, dto);
  }
}
