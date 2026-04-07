import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SHOPLINE_APP_KEY: z.string().min(1, 'SHOPLINE_APP_KEY is required'),
  SHOPLINE_APP_SECRET: z.string().min(1, 'SHOPLINE_APP_SECRET is required'),
  HOST_URL: z.string().url('HOST_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;

export type AppConfig = z.infer<typeof envSchema>;
