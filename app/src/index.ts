import { buildServer } from './server.js';
import { config } from './core/config/index.js';
import { logger } from './core/logger/index.js';
import { prisma } from './core/db/index.js';

async function main() {
  const app = await buildServer();

  try {
    await prisma.$connect();
    logger.info('Database connected');

    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Server running on http://0.0.0.0:${config.PORT}`);
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down...`);
    await prisma.$disconnect();
    process.exit(0);
  });
});

main();
