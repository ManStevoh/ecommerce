import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GatewayConfigService } from './config/gateway-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(GatewayConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet());

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      config.tenantHeader,
      'X-Request-Id',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });

  const port = config.port;
  const host = config.host;

  await app.listen(port, host);

  logger.log(`Nexora API Gateway running on http://${host}:${port}`);
  logger.log(`Environment: ${config.nodeEnv}`);
}

bootstrap().catch((err: Error) => {
  console.error('Failed to start API Gateway:', err.message);
  process.exit(1);
});
