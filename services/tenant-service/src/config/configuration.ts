export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3002', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  baseDomain: process.env.BASE_DOMAIN ?? 'nexora.store',
  internalApiKey: process.env.INTERNAL_API_KEY ?? 'dev-internal-key',
});
