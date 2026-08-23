import { Module } from '@nestjs/common';
import { CursosBeneficiarioController } from './cursos-beneficiario.controller';
import { CursosBeneficiarioService } from './cursos-beneficiario.service';
import { CursosEmpresaController } from './cursos-empresa.controller';
import { CursosEmpresaService } from './cursos-empresa.service';

@Module({
  controllers: [CursosBeneficiarioController, CursosEmpresaController],
  providers: [CursosBeneficiarioService, CursosEmpresaService],
})
export class CursosModule {}
