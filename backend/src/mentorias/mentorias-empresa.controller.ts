import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MentoriasEmpresaService } from './mentorias-empresa.service';
import { CreateMentoriaDto } from './dto/create-mentoria.dto';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';

@Controller('empresas/mentorias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MentoriasEmpresaController {
  constructor(private readonly mentoriasEmpresaService: MentoriasEmpresaService) {}

  @Post()
  @Roles('empresa')
  async crearMentoria(@Req() req: AuthRequest, @Body() createMentoriaDto: CreateMentoriaDto) {
    return this.mentoriasEmpresaService.crearMentoria(req.user.sub, createMentoriaDto);
  }
}
