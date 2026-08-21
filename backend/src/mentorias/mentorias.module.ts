import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { MentoriasBeneficiarioController } from './mentorias-beneficiario.controller';
import { MentoriasBeneficiarioService } from './mentorias-beneficiario.service';

@Module({
  imports: [NotificacionesModule],
  controllers: [MentoriasBeneficiarioController],
  providers: [MentoriasBeneficiarioService],
})
export class MentoriasModule {}
