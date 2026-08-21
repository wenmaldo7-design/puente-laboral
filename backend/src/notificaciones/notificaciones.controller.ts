import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { ContadorNoLeidasResponseDto } from './dto/contador-no-leidas-response.dto';
import { NotificacionResponseDto } from './dto/notificacion-response.dto';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('beneficiario', 'empresa')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  async listar(@Req() req: AuthRequest): Promise<NotificacionResponseDto[]> {
    return this.notificacionesService.listar(req.user);
  }

  @Get('no-leidas')
  async contarNoLeidas(
    @Req() req: AuthRequest,
  ): Promise<ContadorNoLeidasResponseDto> {
    return this.notificacionesService.contarNoLeidas(req.user);
  }

  @Patch(':id/leida')
  async marcarLeida(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificacionResponseDto> {
    return this.notificacionesService.marcarLeida(req.user, id);
  }

  @Patch('leidas')
  async marcarTodasLeidas(
    @Req() req: AuthRequest,
  ): Promise<{ actualizadas: number }> {
    return this.notificacionesService.marcarTodasLeidas(req.user);
  }
}
