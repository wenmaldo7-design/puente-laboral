import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { OfertasLaboralesModule } from './ofertas-laborales/ofertas-laborales.module';
import { MentoriasModule } from './mentorias/mentorias.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee el .env, requerido por AuthModule/JwtModule
    PrismaModule,
    UsersModule,
    AuthModule,
    CatalogosModule,
    BeneficiariosModule,
    OfertasLaboralesModule,
    MentoriasModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
