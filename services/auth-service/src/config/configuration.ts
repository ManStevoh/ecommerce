export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    sessionPrefix: process.env.REDIS_SESSION_PREFIX ?? 'nexora:session:',
    sessionTtlSeconds: 7 * 24 * 60 * 60,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/api/v1/auth/oauth/google/callback',
    },
  },
  tenantServiceUrl:
    process.env.TENANT_SERVICE_URL ?? 'http://localhost:3002',
  internalApiKey: process.env.INTERNAL_API_KEY ?? 'dev-internal-key',
});
