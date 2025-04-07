import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const validationErrors = errors.map((error) => Object.values(error.constraints || {}).join(', '));
        return new BadRequestException(validationErrors);
      },
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Document Management API')
    .setDescription('API documentation for the Document Management System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
