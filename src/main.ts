import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
const corsOrigin = process.env.CORS_ORIGIN || '*';
  const allowedOrigins = corsOrigin === '*' ? '*' : corsOrigin.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins, // Permitir todos los orígenes temporalmente para debug móvil
    credentials: true, // Desactivar credentials para simplificar CORS en móviles
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

 const port = process.env.PORT || 3000; 
  
  await app.listen(port, '0.0.0.0'); // '0.0.0.0' permite conexiones externas en Render
}


bootstrap();