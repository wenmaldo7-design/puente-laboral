import {
  Controller,
  Delete,
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
import { CursosBeneficiarioService } from './cursos-beneficiario.service';
import { CursoResponseDto } from './dto/curso-response.dto';
import { InscripcionCursoResponseDto } from './dto/inscripcion-curso-response.dto';

@Controller('beneficiarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('beneficiario')
export class CursosBeneficiarioController {
  constructor(
    private readonly cursosBeneficiarioService: CursosBeneficiarioService,
  ) {}

  @Get('cursos')
  async listar(@Req() req: AuthRequest): Promise<CursoResponseDto[]> {
    return this.cursosBeneficiarioService.listarDisponibles(req.user.sub);
  }

  @Get('mis-cursos')
  async misCursos(@Req() req: AuthRequest): Promise<CursoResponseDto[]> {
    return this.cursosBeneficiarioService.misCursos(req.user.sub);
  }

  @Get('cursos/:id')
  async detalle(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CursoResponseDto> {
    return this.cursosBeneficiarioService.detalle(req.user.sub, id);
  }

  @Post('cursos/:id/inscripciones')
  async inscribirme(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InscripcionCursoResponseDto> {
    return this.cursosBeneficiarioService.inscribirme(req.user.sub, id);
  }

  @Delete('cursos/:id/inscripciones')
  async darDeBaja(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InscripcionCursoResponseDto> {
    return this.cursosBeneficiarioService.darDeBaja(req.user.sub, id);
  }
}
