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
import { InscripcionResponseDto } from './dto/inscripcion-response.dto';
import { MentoriaResponseDto } from './dto/mentoria-response.dto';
import { MentoriasBeneficiarioService } from './mentorias-beneficiario.service';

@Controller('beneficiarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('beneficiario')
export class MentoriasBeneficiarioController {
  constructor(
    private readonly mentoriasBeneficiarioService: MentoriasBeneficiarioService,
  ) {}

  @Get('mentorias')
  async listar(@Req() req: AuthRequest): Promise<MentoriaResponseDto[]> {
    return this.mentoriasBeneficiarioService.listarDisponibles(req.user.sub);
  }

  @Get('mis-mentorias')
  async misMentorias(@Req() req: AuthRequest): Promise<MentoriaResponseDto[]> {
    return this.mentoriasBeneficiarioService.misMentorias(req.user.sub);
  }

  @Get('mentorias/:id')
  async detalle(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MentoriaResponseDto> {
    return this.mentoriasBeneficiarioService.detalle(req.user.sub, id);
  }

  @Post('mentorias/:id/inscripciones')
  async inscribirme(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InscripcionResponseDto> {
    return this.mentoriasBeneficiarioService.inscribirme(req.user.sub, id);
  }

  @Delete('mentorias/:id/inscripciones')
  async darDeBaja(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InscripcionResponseDto> {
    return this.mentoriasBeneficiarioService.darDeBaja(req.user.sub, id);
  }
}
