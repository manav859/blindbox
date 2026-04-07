import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { config } from './core/config/index.js';
import { logger } from './core/logger/index.js';
import { errorHandler } from './core/middleware/error-handler.js';
import { requestLogger } from './core/middleware/request-logger.js';

import fastifyRawBody from 'fastify-raw-body';

// Module routes
import { healthRoutes } from './modules/health/health.route.js';
import { authRoutes } from './modules/auth/auth.route.js';
import { blindBoxConfigRoutes } from './modules/blind-box-config/blind-box-config.route.js';
import { productRoutes } from './modules/products/products.route.js';
import { webhookRoutes } from './modules/blind-box-webhooks/webhook.route.js';
import { assignmentRoutes } from './modules/blind-box-assignment/assignment.route.js';
import { storefrontRoutes } from './modules/storefront/storefront.route.js';
import { shopRoutes } from './modules/shops/shops.route.js';

export async function buildServer() {
  const app = Fastify({
    logger: false, // We use our own Pino logger
  });

  // ---------- plugins ----------
  await app.register(cors, { origin: true, credentials: true });
  await app.register(formbody);
  await app.register(fastifyRawBody, {
    field: 'rawBody',
    global: true,
    encoding: 'utf8',
    runFirst: true
  });

  // ---------- hooks ----------
  app.addHook('onRequest', requestLogger);
  app.setErrorHandler(errorHandler);

  // ---------- routes ----------
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(shopRoutes, { prefix: '/api/admin/shops' });
  await app.register(blindBoxConfigRoutes, { prefix: '/api/admin/blind-boxes' });
  await app.register(productRoutes, { prefix: '/api/admin/products' });
  await app.register(assignmentRoutes, { prefix: '/api/admin' });
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });
  await app.register(storefrontRoutes, { prefix: '/api/storefront' });

  logger.info('All routes registered');

  return app;
}
