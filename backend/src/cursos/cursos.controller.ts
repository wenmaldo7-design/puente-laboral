import { Controller, Get, Param } from '@nestjs/common';
import { CursosService } from './cursos.service';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get('match/:id')
  async getMatch(@Param('id') id: string) {
    return this.cursosService.getMatchCursos(Number(id));
  }
}