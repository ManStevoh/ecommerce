import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z
    .string()
    .min(32)
    .default(
      () =>
        process.env.JWT_ACCESS_SECRET ||
        'nexora-dev-jwt-secret-change-in-production-32chars'
    ),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
});

export const gatewayEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGINS: z
    .string()
    .default('*')
    .transform((val) =>
      val === '*' ? ['*'] : val.split(',').map((o) => o.trim()),
    ),
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  TENANT_HEADER: z.string().default('x-tenant-id'),
  BASE_DOMAIN: z.string().default('nexora.local'),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  TENANT_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  CATALOG_SERVICE_URL: z.string().url().default('http://localhost:3003'),
  ORDER_SERVICE_URL: z.string().url().default('http://localhost:3004'),
  PAYMENT_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  SUBSCRIPTION_SERVICE_URL: z.string().url().default('http://localhost:3006'),
  AI_SERVICE_URL: z.string().url().default('http://localhost:3007'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3008'),
  SEARCH_SERVICE_URL: z.string().url().default('http://localhost:3009'),
  ANALYTICS_SERVICE_URL: z.string().url().default('http://localhost:3010'),
  SUPPORT_SERVICE_URL: z.string().url().default('http://localhost:3011'),
  MARKETING_SERVICE_URL: z.string().url().default('http://localhost:3012'),
  CMS_SERVICE_URL: z.string().url().default('http://localhost:3013'),
  GRAPHQL_SERVICE_URL: z.string().url().default('http://localhost:3014'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;

export type EnvSchema<T extends z.ZodTypeAny> = T;

export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: NodeJS.ProcessEnv = process.env,
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    const messages = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${(errors ?? []).join(', ')}`)
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${messages}\n\nPlease check your .env file.`,
    );
  }

  return result.data;
}

export function loadGatewayEnv(
  env: NodeJS.ProcessEnv = process.env,
): GatewayEnv {
  return validateEnv(gatewayEnvSchema, env);
}

export function loadBaseEnv(env: NodeJS.ProcessEnv = process.env): BaseEnv {
  return validateEnv(baseEnvSchema, env);
}
