import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // ⬅️ add this
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // ⬅️ typed as Express
  const configService = app.get(ConfigService);

  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.ip === '127.0.0.1',
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api'); // → your routes live at /api/v1/*

  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DayCare API')
      .setDescription('API para comunicación guarderías/preescolares')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth')
      .addTag('users')
      .addTag('children')
      .addTag('attendance')
      .addTag('timeline')
      .addTag('messages')
      .addTag('consents')
      .addTag('files')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, { swaggerOptions: { persistAuthorization: true } });
  }

  const port = Number(configService.get('PORT')) || 3001;

  // In Codespaces or containers, binding to 0.0.0.0 avoids “only accessible from inside”
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 DayCare API Server: http://localhost:${port}`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
  console.log(`📍 Base URL: http://localhost:${port}/api/v1`);
}

bootstrap();
