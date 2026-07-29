import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() hace que PrismaService este disponible en toda la app
 * sin necesidad de re-importar este modulo en cada feature module,
 * garantizando que exista una unica instancia compartida (singleton).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
