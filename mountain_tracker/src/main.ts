import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

// (#3)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // (#4)
  const config = new DocumentBuilder()
    .setTitle('MountainTracker API')
    .setDescription('REST API for managing mountains, hiking trails, users, and traveler reviews')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // (#5)
  await app.listen(process.env.PORT ?? 3200);
}
await bootstrap();
