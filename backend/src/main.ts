import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // COOKIE_SECRET firma la cookie del JWT (cookie-parser).
  // Necesario para que req.signedCookies exista en JwtStrategy.
  app.use(cookieParser(config.get<string>('COOKIE_SECRET')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Antes era app.enableCors() a secas (permite cualquier origen, sin cookies).
  // Con auth por cookie firmada, el navegador solo manda/guarda la cookie si
  // el origen es explicito y credentials:true (no se puede combinar con '*').
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:4200'),
    credentials: true,
  });

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
