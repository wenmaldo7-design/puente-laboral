import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee el .env, requerido por AuthModule/JwtModule
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController], // health check original, intacto
  providers: [AppService],
})
export class AppModule {}
