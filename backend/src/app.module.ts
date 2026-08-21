import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CursosController } from './cursos/cursos.controller'; // <--- Importar el controlador
import { CursosService } from './cursos/cursos.service';       // <--- Importar el servicio
import { PrismaService } from './prisma/prisma.service';       // <--- Asegurar Prisma

@Module({
  imports: [],
  controllers: [AppController, CursosController],           
  providers: [AppService, CursosService, PrismaService],       
})
export class AppModule {}