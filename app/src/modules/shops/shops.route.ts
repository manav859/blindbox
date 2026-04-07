import type { FastifyInstance } from 'fastify';
import { shopService } from './shops.service.js';

export async function shopRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const shops = await shopService.listShops();
    return reply.send(shops);
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const shop = await shopService.getShopById(id);
    if (!shop) return reply.status(404).send({ error: 'Shop not found' });
    return reply.send(shop);
  });
}
