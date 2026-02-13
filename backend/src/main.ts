import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  // FIX: CSRF - restrictive CORS configuration with explicit origin
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // FIX: CSRF - generate XSRF-TOKEN cookie on every response (double-submit cookie pattern)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies?.['XSRF-TOKEN']) {
      const token = randomBytes(32).toString('hex');
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Must be readable by JavaScript
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Chatty API')
    .setDescription('The Chatty API description')
    .setVersion('1.0')
    .addTag('chatty')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
