import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({
    origin: [
      'http://localhost:5173',      // dev front
      'https://finan.humberto.dev.br', // front em produção
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3050);
}
bootstrap();
