import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { PostulacionResponseDto } from './dto/postulacion-response.dto';
import { PostulacionesService } from './postulaciones.service';

@Controller('beneficiarios/postulaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('beneficiario')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Get()
  async misPostulaciones(
    @Req() req: AuthRequest,
  ): Promise<PostulacionResponseDto[]> {
    return this.postulacionesService.misPostulaciones(req.user.sub);
  }
}
