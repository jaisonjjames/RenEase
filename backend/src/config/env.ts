import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

const parseOrigins = (value?: string) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const mongoUri = process.env.MONGO_URI?.trim();
const jwtSecret = process.env.JWT_SECRET?.trim();

if (isProduction) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required in production.');
  }

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required in production.');
  }
}

export const env = {
  nodeEnv,
  isProduction,
  isDevelopment,
  port: Number(process.env.PORT ?? 5001),
  mongoUri,
  jwtSecret: jwtSecret ?? 'dev-only-jwt-secret',
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
  enableDemoSeeding:
    process.env.ENABLE_DEMO_SEEDING === 'true' ||
    (isDevelopment && process.env.ENABLE_DEMO_SEEDING !== 'false'),
  demoAdmin: {
    name: process.env.SUPERADMIN_NAME?.trim() || 'Super Admin',
    email: process.env.SUPERADMIN_EMAIL?.trim() || 'admin@gmail.com',
    password: process.env.SUPERADMIN_PASSWORD?.trim() || 'admin'
  },
  requireEnv
};
