import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';

const prisma = new PrismaClient({
  datasourceUrl: config.DATABASE_URL,
  log: config.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export { prisma };
