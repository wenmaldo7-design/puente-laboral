import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * PrismaService centraliza la conexion a PostgreSQL.
 *
 * Desde Prisma 7 se elimino el motor de conexion interno: hay que pasarle
 * explicitamente un "driver adapter" (aca, @prisma/adapter-pg sobre `pg`)
 * al constructor de PrismaClient. Ver: https://pris.ly/d/driver-adapters
 *
 * NestJS ya trata a los providers sin scope explicito como singletons
 * dentro del contenedor de DI, pero como el requerimiento pide el patron
 * Singleton de forma explicita, reforzamos esa garantia con una instancia
 * estatica: sin importar cuantas veces se intente instanciar la clase
 * "a mano" (fuera del ciclo de vida de Nest), siempre se reutiliza la
 * misma conexion.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static instance: PrismaService;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log: ['error', 'warn'],
    });

    PrismaService.instance = this;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conexion a PostgreSQL establecida (Prisma singleton)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Conexion a PostgreSQL cerrada');
  }
}
