import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SHOPLINE_APP_KEY: z.string().min(1, 'SHOPLINE_APP_KEY is required'),
  SHOPLINE_APP_SECRET: z.string().min(1, 'SHOPLINE_APP_SECRET is required'),
  HOST_URL: z.string().url('HOST_URL must be a valid URL').transform((u) => u.replace(/\/$/, '')),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').transform((u) => u.replace(/\/$/, '')),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n' + '='.repeat(50));
  console.error('❌ CONFIGURATION ERROR: Missing or invalid environment variables');
  console.error('='.repeat(50));
  
  const formatted = parsed.error.format();
  Object.entries(formatted).forEach(([key, value]) => {
    if (key !== '_errors') {
      const fieldErrors = (value as any)._errors;
      if (fieldErrors && fieldErrors.length > 0) {
        console.error(`- ${key}: ${fieldErrors.join(', ')}`);
      }
    }
  });
  
  console.error('='.repeat(50));
  console.error('Please check your Render Environment Variables dashboard.\n');
  process.exit(1);
}

export const config = parsed.data;

export type AppConfig = z.infer<typeof envSchema>;
