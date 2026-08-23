import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { CursosBeneficiarioController } from './cursos-beneficiario.controller';
import { CursosBeneficiarioService } from './cursos-beneficiario.service';
import { CursosEmpresaController } from './cursos-empresa.controller';
import { CursosEmpresaService } from './cursos-empresa.service';

@Module({
  imports: [NotificacionesModule],
  controllers: [CursosBeneficiarioController, CursosEmpresaController],
  providers: [CursosBeneficiarioService, CursosEmpresaService],
})
export class CursosModule {}
