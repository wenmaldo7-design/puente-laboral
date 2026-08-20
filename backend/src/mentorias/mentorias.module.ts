import { Module } from '@nestjs/common';
import { MentoriasBeneficiarioController } from './mentorias-beneficiario.controller';
import { MentoriasBeneficiarioService } from './mentorias-beneficiario.service';

@Module({
  controllers: [MentoriasBeneficiarioController],
  providers: [MentoriasBeneficiarioService],
})
export class MentoriasModule {}
