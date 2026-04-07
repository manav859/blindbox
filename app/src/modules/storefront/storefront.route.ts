import type { FastifyInstance } from 'fastify';
import { blindBoxConfigService } from '../blind-box-config/blind-box-config.service.js';
import { assignmentService } from '../blind-box-assignment/assignment.service.js';

export async function storefrontRoutes(app: FastifyInstance) {
  
  /**
   * GET /api/storefront/blind-box/:productId
   * Retrieve blind box properties (the pool of items and their relative probabilities/availabilities).
   * Used by the storefront Theme on product pages.
   */
  app.get('/blind-box/:productId', async (request, reply) => {
    const { productId } = request.params as { productId: string };
    
    // We get the blind box and ONLY the enabled items
    const blindBox = await blindBoxConfigService.getByProductId(productId);
    
    if (!blindBox || blindBox.status !== 'ACTIVE') {
      return reply.status(404).send({ error: 'Blind Box not found or inactive' });
    }

    // Strip out exact internal inventory counts for security on storefront,
    // only expose whether it is inStock and the weights.
    const items = blindBox.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      weight: item.weight,
      inStock: item.inventory > 0,
    }));

    return reply.send({
      id: blindBox.id,
      productId: blindBox.productId,
      name: blindBox.name,
      items,
    });
  });

  /**
   * GET /api/storefront/orders/:orderId/reveal
   * Retrieve assignments for a given order, allowing the storefront to 'reveal' 
   * the picked items to the user on the post-purchase page.
   */
  app.get('/orders/:orderId/reveal', async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    
    const assignments = await assignmentService.getByOrderId(orderId);
    
    if (!assignments || assignments.length === 0) {
      // Return 202 if pending webhook processing, or 404 if no blind box items
      return reply.status(200).send({
        orderId,
        status: 'PENDING_OR_NOT_FOUND',
        assignments: [],
      });
    }

    const formatted = assignments.map((a: any) => ({
      blindBoxProductId: a.blindBox.productId,
      blindBoxName: a.blindBox.name,
      assignedItemId: a.itemId,
      assignedItemName: a.item.name,
      status: a.status,
    }));

    return reply.send({
      orderId,
      status: 'COMPLETED',
      assignments: formatted,
    });
  });
}
