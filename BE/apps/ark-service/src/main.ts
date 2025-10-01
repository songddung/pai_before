import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Build test timestamp: 2024-09-16 ark-service - deployment fix

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // (선택) CORS가 필요하면
  // app.enableCors();

  const port = parseInt(process.env.PORT ?? '3003', 10);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
