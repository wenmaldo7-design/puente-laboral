import { Module } from '@nestjs/common';
import { CursosBeneficiarioController } from './cursos-beneficiario.controller';
import { CursosBeneficiarioService } from './cursos-beneficiario.service';

@Module({
  controllers: [CursosBeneficiarioController],
  providers: [CursosBeneficiarioService],
})
export class CursosModule {}
