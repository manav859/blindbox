import type { FastifyInstance } from 'fastify';
import { config } from '../../core/config/index.js';
import { logger } from '../../core/logger/index.js';

/**
 * Auth routes scaffold for SHOPLINE OAuth 2.0 flow.
 *
 * App URL  → GET /api/auth/install  (initiates OAuth)
 * Callback → GET /api/auth/callback (exchanges code for token)
 */
export async function authRoutes(app: FastifyInstance) {
  /**
   * Step 1: Merchant clicks "Install" in SHOPLINE App Store.
   * SHOPLINE sends them here with ?shop=xxx
   * We redirect to SHOPLINE's OAuth consent screen.
   */
  app.get('/install', async (request, reply) => {
    const { shop } = request.query as { shop?: string };

    if (!shop) {
      return reply.status(400).send({ error: 'Missing shop parameter' });
    }

    // Build SHOPLINE OAuth authorize URL
    const redirectUri = `${config.HOST_URL}/api/auth/callback`;
    const scopes = 'read_products,write_products,read_orders,write_orders';

    const authUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${config.SHOPLINE_APP_KEY}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes}` +
      `&response_type=code`;

    logger.info({ shop, authUrl }, 'Redirecting merchant to SHOPLINE OAuth');
    return reply.redirect(authUrl);
  });

  /**
   * Step 2: SHOPLINE redirects back here with ?code=xxx&shop=xxx
   * We exchange the code for an access token and persist the shop.
   */
  app.get('/callback', async (request, reply) => {
    const { code, shop } = request.query as { code?: string; shop?: string };

    if (!code || !shop) {
      return reply.status(400).send({ error: 'Missing code or shop parameter' });
    }

    try {
      // TODO: Exchange code for access token via SHOPLINE API
      // POST https://{shop}/admin/oauth/token
      // body: { client_id, client_secret, code }
      //
      // For now we log and scaffold the flow:
      logger.info({ shop, code: code.substring(0, 6) + '...' }, 'OAuth callback received');

      // After token exchange, upsert shop record:
      // await shopService.upsertShop({ domain: shop, accessToken: token, scopes });

      // Redirect merchant to Admin UI
      return reply.redirect(`${config.FRONTEND_URL}/admin`);
    } catch (err) {
      logger.error({ err }, 'OAuth callback failed');
      return reply.status(500).send({ error: 'Authentication failed' });
    }
  });
}
