import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { config } from '../../core/config/index.js';
import { prisma } from '../../core/db/index.js';
import { logger } from '../../core/logger/index.js';
import { assignmentService } from '../blind-box-assignment/assignment.service.js';
import { blindBoxConfigService } from '../blind-box-config/blind-box-config.service.js';

/**
 * Validates the SHOPLINE webhook signature.
 */
function verifySignature(payload: string, signature: string): boolean {
  if (!config.SHOPLINE_APP_SECRET || !signature) return false;
  
  const hmac = crypto.createHmac('sha256', config.SHOPLINE_APP_SECRET);
  const digest = hmac.update(payload, 'utf8').digest('base64');
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function webhookRoutes(app: FastifyInstance) {
  /**
   * Endpoint to receive the orders/paid webhook from SHOPLINE.
   * 
   * Note: Webhook payloads must be parsed as raw raw text so they can be accurately verified.
   * By default Fastify parses JSON, so we need to either get rawBody or re-stringify.
   * Assuming `fastify.addContentTypeParser` exists or middleware handles raw body for webhooks,
   * but for this MVP, we will assume standard body payload for demonstration logic.
   */
  app.post('/orders-paid', async (request, reply) => {
    // 1. Signature validation (scaffold)
    const signature = request.headers['x-shopline-hmac-sha256'] as string;
    const eventId = request.headers['x-shopline-delivery-id'] as string;
    const shopDomain = request.headers['x-shopline-shop-domain'] as string;
    
    // In a real app we need the raw body text. Assuming it's verified here.
    const rawBody = JSON.stringify(request.body);
    
    if (config.NODE_ENV === 'production' && !verifySignature(rawBody, signature)) {
      logger.warn('Webhook signature verification failed');
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (!eventId || !shopDomain) {
      return reply.status(400).send({ error: 'Missing mandatory webhook headers' });
    }

    // 2. Resolve Shop
    const shop = await prisma.shop.findUnique({ where: { myshoplineDomain: shopDomain } });
    if (!shop) {
      logger.warn({ shopDomain }, 'Webhook received for unknown shop');
      return reply.status(200).send('OK'); // Return 200 so SHOPLINE doesn't retry
    }

    // 3. Idempotency Check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { shoplineEventId: eventId },
    });

    if (existingEvent) {
      logger.info({ eventId }, 'Webhook already processed (idempotent)');
      return reply.status(200).send('OK');
    }

    // Insert pending webhook event
    await prisma.webhookEvent.create({
      data: {
        shopId: shop.id,
        shoplineEventId: eventId,
        topic: 'orders/paid',
        payload: rawBody,
        status: 'PENDING',
      },
    });

    // 4. Parse payload and process Line Items
    // Expected SHOPLINE order payload structure
    const payload = request.body as any;
    const orderId = payload.id;
    const lineItems = payload.line_items || [];

    try {
      for (const item of lineItems) {
        const productId = item.product_id;
        const quantity = item.quantity || 1;

        // Check if this product is configured as a blind box
        const blindBox = await blindBoxConfigService.getByProductId(String(productId));
        
        if (blindBox && blindBox.status === 'ACTIVE') {
          logger.info({ orderId, blindBoxId: blindBox.id, quantity }, 'Processing blind box purchase');
          
          await assignmentService.assignItem({
            orderId: String(orderId),
            blindBoxId: blindBox.id,
            quantity: quantity,
          });
        }
      }

      // Mark event as completed
      await prisma.webhookEvent.update({
        where: { shoplineEventId: eventId },
        data: { status: 'COMPLETED' },
      });

      return reply.status(200).send('OK');
    } catch (err) {
      logger.error({ err, eventId }, 'Error processing webhook payload');
      
      // We don't necessarily want to return a 500 error unless we want SHOPLINE to retry.
      // Usually, we return 200 to acknowledge receipt and handle errors asynchronously,
      // but if the assignment fails fundamentally, a retry might be appropriate.
      return reply.status(500).send({ error: 'Processing failed' });
    }
  });
}
