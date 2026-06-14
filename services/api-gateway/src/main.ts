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
    origin: (origin, callback) => {
      const allowed = config.corsOrigins;
      if (allowed.includes('*') || !origin) {
        callback(null, true);
      } else {
        const isAllowed = allowed.some((domain) => {
          if (domain === origin) return true;
          if (domain.startsWith('*.')) {
            const suffix = domain.slice(2);
            try {
              const originHost = new URL(origin).hostname;
              return originHost === suffix || originHost.endsWith('.' + suffix);
            } catch {
              return false;
            }
          }
          return false;
        });
        callback(null, isAllowed);
      }
    },
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
  logger.log(`Allowed CORS Origins: ${JSON.stringify(config.corsOrigins)}`);
}

bootstrap().catch((err: Error) => {
  console.error('Failed to start API Gateway:', err.message);
  process.exit(1);
});
