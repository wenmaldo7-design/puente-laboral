import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { MentoriasBeneficiarioController } from './mentorias-beneficiario.controller';
import { MentoriasBeneficiarioService } from './mentorias-beneficiario.service';
import { MentoriasEmpresaController } from './mentorias-empresa.controller';
import { MentoriasEmpresaService } from './mentorias-empresa.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [NotificacionesModule, PrismaModule],
  controllers: [MentoriasBeneficiarioController, MentoriasEmpresaController],
  providers: [MentoriasBeneficiarioService, MentoriasEmpresaService],
})
export class MentoriasModule {}
