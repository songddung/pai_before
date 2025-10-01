import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Build test timestamp: 2024-09-16 media-service - deployment fix

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe는 class-validator가 설치된 후에 활성화
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 필요하면 CORS
  // app.enableCors();

  const port = parseInt(process.env.PORT ?? '3002', 10);
  console.log(`🚀 Media service starting on port ${port}`);
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Media service is running on http://localhost:${port}`);
}
bootstrap();
