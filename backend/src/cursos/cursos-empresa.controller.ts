import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CursosEmpresaService } from './cursos-empresa.service';
import { CreateCursoBackendDto } from './dto/create-curso.dto';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';

@Controller('empresas/cursos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CursosEmpresaController {
  constructor(private readonly cursosEmpresaService: CursosEmpresaService) {}

  @Post()
  @Roles('empresa')
  async crearCurso(@Req() req: AuthRequest, @Body() dto: CreateCursoBackendDto) {
    return this.cursosEmpresaService.crearCurso(req.user.sub, dto);
  }
}
